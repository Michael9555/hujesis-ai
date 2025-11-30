import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { addDays, addHours } from "date-fns";
import { Repository } from "typeorm";
import { AppDataSource } from "../../config/database";
import { config } from "../../config";
import { User, UserRole } from "../users/user.entity";
import { RefreshToken } from "./refresh-token.entity";
import {
  UnauthorizedError,
  ConflictError,
  BadRequestError,
} from "../../utils/errors";
import { JwtPayload } from "../../middleware/auth";
import { RegisterInput, LoginInput } from "./auth.schema";
import logger from "../../utils/logger";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthResponse {
  user: Partial<User>;
  tokens: TokenPair;
}

export class AuthService {
  private userRepository: Repository<User>;
  private refreshTokenRepository: Repository<RefreshToken>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
  }

  async register(input: RegisterInput): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findOne({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    const user = this.userRepository.create({
      email: input.email,
      password: input.password,
      firstName: input.firstName,
      lastName: input.lastName,
      role: UserRole.USER,
    });

    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user);

    logger.info(`New user registered: ${user.email}`);

    return {
      user: user.toJSON(),
      tokens,
    };
  }

  async login(
    input: LoginInput,
    userAgent?: string,
    ipAddress?: string
  ): Promise<AuthResponse> {
    const user = await this.userRepository.findOne({
      where: { email: input.email },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Account is deactivated");
    }

    const isPasswordValid = await user.comparePassword(input.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user, userAgent, ipAddress);

    logger.info(`User logged in: ${user.email}`);

    return {
      user: user.toJSON(),
      tokens,
    };
  }

  async refreshTokens(
    refreshToken: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<TokenPair> {
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
      relations: ["user"],
    });

    if (!storedToken) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    if (!storedToken.isValid) {
      // Revoke all tokens for this user if token is invalid (potential theft)
      await this.revokeAllUserTokens(storedToken.userId);
      throw new UnauthorizedError("Refresh token is expired or revoked");
    }

    if (!storedToken.user.isActive) {
      throw new UnauthorizedError("Account is deactivated");
    }

    // Revoke the used refresh token (rotation)
    storedToken.isRevoked = true;
    await this.refreshTokenRepository.save(storedToken);

    // Generate new token pair
    return this.generateTokens(storedToken.user, userAgent, ipAddress);
  }

  async logout(refreshToken: string): Promise<void> {
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
    });

    if (storedToken) {
      storedToken.isRevoked = true;
      await this.refreshTokenRepository.save(storedToken);
    }
  }

  async logoutAll(userId: string): Promise<void> {
    await this.revokeAllUserTokens(userId);
    logger.info(`All sessions logged out for user: ${userId}`);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestError("User not found");
    }

    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    user.password = newPassword;
    await this.userRepository.save(user);

    // Revoke all refresh tokens
    await this.revokeAllUserTokens(userId);

    logger.info(`Password changed for user: ${user.email}`);
  }

  private async generateTokens(
    user: User,
    userAgent?: string,
    ipAddress?: string
  ): Promise<TokenPair> {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    const refreshTokenValue = uuidv4();
    const expiresAt = addDays(new Date(), 30);

    const refreshToken = this.refreshTokenRepository.create({
      token: refreshTokenValue,
      userId: user.id,
      expiresAt,
      userAgent,
      ipAddress,
    });

    await this.refreshTokenRepository.save(refreshToken);

    // Calculate access token expiry in seconds
    const expiresIn = this.parseExpiresIn(config.jwt.expiresIn);

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      expiresIn,
    };
  }

  private async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true }
    );
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([dhms])$/);
    if (!match) return 3600;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case "d":
        return value * 24 * 60 * 60;
      case "h":
        return value * 60 * 60;
      case "m":
        return value * 60;
      case "s":
        return value;
      default:
        return 3600;
    }
  }

  // Cleanup expired tokens (should be run periodically)
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .where("expiresAt < :now", { now: new Date() })
      .orWhere("isRevoked = :revoked", { revoked: true })
      .execute();

    return result.affected || 0;
  }
}

export default new AuthService();
