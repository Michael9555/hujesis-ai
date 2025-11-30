import { Repository } from "typeorm";
import { AppDataSource } from "../../config/database";
import { User } from "./user.entity";
import { NotFoundError } from "../../utils/errors";
import { UpdateProfileInput } from "./user.schema";
import logger from "../../utils/logger";

export class UserService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async findById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async updateProfile(
    userId: string,
    input: UpdateProfileInput
  ): Promise<User> {
    const user = await this.findById(userId);

    if (input.firstName !== undefined) {
      user.firstName = input.firstName;
    }

    if (input.lastName !== undefined) {
      user.lastName = input.lastName;
    }

    if (input.avatarUrl !== undefined) {
      user.avatarUrl = input.avatarUrl || undefined;
    }

    await this.userRepository.save(user);
    logger.info(`User profile updated: ${userId}`);

    return user;
  }

  async deactivate(userId: string): Promise<void> {
    const user = await this.findById(userId);
    user.isActive = false;
    await this.userRepository.save(user);
    logger.info(`User deactivated: ${userId}`);
  }

  async activate(userId: string): Promise<void> {
    const user = await this.findById(userId);
    user.isActive = true;
    await this.userRepository.save(user);
    logger.info(`User activated: ${userId}`);
  }

  async delete(userId: string): Promise<void> {
    const user = await this.findById(userId);
    await this.userRepository.remove(user);
    logger.info(`User deleted: ${userId}`);
  }

  async getDashboardStats(userId: string): Promise<{
    user: Partial<User>;
    promptCount: number;
    imageCount: number;
    favoritePromptsCount: number;
    favoriteImagesCount: number;
  }> {
    const user = await this.findById(userId);

    const promptCount = await AppDataSource.getRepository("Prompt").count({
      where: { userId },
    });

    const imageCount = await AppDataSource.getRepository(
      "GeneratedImage"
    ).count({
      where: { userId },
    });

    const favoritePromptsCount = await AppDataSource.getRepository(
      "Prompt"
    ).count({
      where: { userId, isFavorite: true },
    });

    const favoriteImagesCount = await AppDataSource.getRepository(
      "GeneratedImage"
    ).count({
      where: { userId, isFavorite: true },
    });

    return {
      user: user.toJSON(),
      promptCount,
      imageCount,
      favoritePromptsCount,
      favoriteImagesCount,
    };
  }
}

export default new UserService();
