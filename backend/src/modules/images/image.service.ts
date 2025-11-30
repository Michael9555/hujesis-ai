import { Repository, FindOptionsWhere } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { AppDataSource } from "../../config/database";
import { GeneratedImage, ImageStatus } from "./image.entity";
import promptService from "../prompts/prompt.service";
import { NotFoundError, ForbiddenError } from "../../utils/errors";
import {
  GenerateImageInput,
  UpdateImageInput,
  ImageQueryInput,
} from "./image.schema";
import logger from "../../utils/logger";

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Mock image URLs for demo purposes
const MOCK_IMAGES = [
  "https://picsum.photos/seed/img1/512/512",
  "https://picsum.photos/seed/img2/512/512",
  "https://picsum.photos/seed/img3/512/512",
  "https://picsum.photos/seed/img4/512/512",
  "https://picsum.photos/seed/img5/512/512",
];

export class ImageService {
  private imageRepository: Repository<GeneratedImage>;

  constructor() {
    this.imageRepository = AppDataSource.getRepository(GeneratedImage);
  }

  async generate(
    userId: string,
    input: GenerateImageInput
  ): Promise<GeneratedImage> {
    const startTime = Date.now();

    // Create image record with pending status
    const image = this.imageRepository.create({
      userId,
      promptId: input.promptId,
      promptUsed: input.prompt,
      negativePromptUsed: input.negativePrompt,
      status: ImageStatus.PROCESSING,
      generationSettings: {
        width: input.settings?.width || 512,
        height: input.settings?.height || 512,
        steps: input.settings?.steps || 30,
        cfgScale: input.settings?.cfgScale || 7,
        sampler: input.settings?.sampler || "Euler a",
        seed: input.settings?.seed || Math.floor(Math.random() * 2147483647),
        model: input.settings?.model,
      },
    });

    await this.imageRepository.save(image);

    // Simulate AI image generation (mock)
    try {
      await this.mockImageGeneration();

      // Update with mock result
      const seed =
        image.generationSettings?.seed || Math.floor(Math.random() * 1000);
      const mockUrl = `https://picsum.photos/seed/${seed}/${
        image.generationSettings?.width || 512
      }/${image.generationSettings?.height || 512}`;

      image.imageUrl = mockUrl;
      image.thumbnailUrl = `https://picsum.photos/seed/${seed}/256/256`;
      image.width = image.generationSettings?.width || 512;
      image.height = image.generationSettings?.height || 512;
      image.fileSize = Math.floor(Math.random() * 500000) + 100000;
      image.mimeType = "image/jpeg";
      image.status = ImageStatus.COMPLETED;
      image.generationTimeMs = Date.now() - startTime;

      await this.imageRepository.save(image);

      // Increment usage count if linked to a prompt
      if (input.promptId) {
        await promptService.incrementUsageCount(input.promptId);
      }

      logger.info(`Image generated: ${image.id} for user ${userId}`);
    } catch (error) {
      image.status = ImageStatus.FAILED;
      image.errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      await this.imageRepository.save(image);
      throw error;
    }

    return image;
  }

  private async mockImageGeneration(): Promise<void> {
    // Simulate generation delay (1-3 seconds)
    const delay = Math.floor(Math.random() * 2000) + 1000;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  async findAll(
    userId: string,
    query: ImageQueryInput
  ): Promise<PaginatedResult<GeneratedImage>> {
    const { page, limit, promptId, status, isFavorite, sortBy, sortOrder } =
      query;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<GeneratedImage> = { userId };

    if (promptId) {
      where.promptId = promptId;
    }

    if (status) {
      where.status = status as GeneratedImage["status"];
    }

    if (isFavorite !== undefined) {
      where.isFavorite = isFavorite;
    }

    const [data, total] = await this.imageRepository.findAndCount({
      where,
      order: { [sortBy]: sortOrder },
      skip,
      take: limit,
      relations: ["prompt"],
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(imageId: string, userId?: string): Promise<GeneratedImage> {
    const image = await this.imageRepository.findOne({
      where: { id: imageId },
      relations: ["prompt"],
    });

    if (!image) {
      throw new NotFoundError("Image not found");
    }

    if (userId && image.userId !== userId) {
      throw new ForbiddenError("You do not have access to this image");
    }

    return image;
  }

  async update(
    imageId: string,
    userId: string,
    input: UpdateImageInput
  ): Promise<GeneratedImage> {
    const image = await this.findById(imageId, userId);

    if (input.isFavorite !== undefined) {
      image.isFavorite = input.isFavorite;
    }

    if (input.tags) {
      image.tags = input.tags.filter((tag): tag is string => tag !== undefined);
    }

    await this.imageRepository.save(image);
    return image;
  }

  async delete(imageId: string, userId: string): Promise<void> {
    const image = await this.findById(imageId, userId);
    // In a real app, also delete the file from storage
    await this.imageRepository.remove(image);
    logger.info(`Image deleted: ${imageId}`);
  }

  async toggleFavorite(
    imageId: string,
    userId: string
  ): Promise<GeneratedImage> {
    const image = await this.findById(imageId, userId);
    image.isFavorite = !image.isFavorite;
    await this.imageRepository.save(image);
    return image;
  }

  async bulkDelete(imageIds: string[], userId: string): Promise<number> {
    let deletedCount = 0;

    for (const id of imageIds) {
      try {
        await this.delete(id, userId);
        deletedCount++;
      } catch (error) {
        // Log but continue with other deletions
        logger.warn(`Failed to delete image ${id}: ${error}`);
      }
    }

    return deletedCount;
  }

  async getUserStats(userId: string): Promise<{
    totalImages: number;
    completedCount: number;
    failedCount: number;
    favoriteCount: number;
    totalGenerationTime: number;
  }> {
    const totalImages = await this.imageRepository.count({
      where: { userId },
    });

    const completedCount = await this.imageRepository.count({
      where: { userId, status: ImageStatus.COMPLETED },
    });

    const failedCount = await this.imageRepository.count({
      where: { userId, status: ImageStatus.FAILED },
    });

    const favoriteCount = await this.imageRepository.count({
      where: { userId, isFavorite: true },
    });

    const result = await this.imageRepository
      .createQueryBuilder("image")
      .select("SUM(image.generationTimeMs)", "total")
      .where("image.userId = :userId", { userId })
      .andWhere("image.status = :status", { status: ImageStatus.COMPLETED })
      .getRawOne();

    return {
      totalImages,
      completedCount,
      failedCount,
      favoriteCount,
      totalGenerationTime: parseInt(result?.total || "0", 10),
    };
  }
}

export default new ImageService();
