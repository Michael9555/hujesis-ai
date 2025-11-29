import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { AppDataSource } from '../../config/database';
import { Prompt, PromptStatus } from './prompt.entity';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { CreatePromptInput, UpdatePromptInput, PromptQueryInput } from './prompt.schema';
import logger from '../../utils/logger';

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class PromptService {
  private promptRepository: Repository<Prompt>;

  constructor() {
    this.promptRepository = AppDataSource.getRepository(Prompt);
  }

  async create(userId: string, input: CreatePromptInput): Promise<Prompt> {
    const prompt = this.promptRepository.create({
      ...input,
      userId,
      tags: input.tags?.filter((tag): tag is string => tag !== undefined),
    });

    await this.promptRepository.save(prompt);
    logger.info(`Prompt created: ${prompt.id} by user ${userId}`);

    return prompt;
  }

  async findAll(
    userId: string,
    query: PromptQueryInput
  ): Promise<PaginatedResult<Prompt>> {
    const { page, limit, search, category, status, isFavorite, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Prompt> = { userId };

    if (category) {
      where.category = category as Prompt['category'];
    }

    if (status) {
      where.status = status as Prompt['status'];
    } else {
      // By default, don't show archived prompts
      where.status = PromptStatus.ACTIVE;
    }

    if (isFavorite !== undefined) {
      where.isFavorite = isFavorite;
    }

    const queryBuilder = this.promptRepository
      .createQueryBuilder('prompt')
      .where(where);

    if (search) {
      queryBuilder.andWhere(
        '(prompt.title ILIKE :search OR prompt.content ILIKE :search OR prompt.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    queryBuilder
      .orderBy(`prompt.${sortBy}`, sortOrder as 'ASC' | 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(promptId: string, userId?: string): Promise<Prompt> {
    const prompt = await this.promptRepository.findOne({
      where: { id: promptId },
      relations: ['generatedImages'],
    });

    if (!prompt) {
      throw new NotFoundError('Prompt not found');
    }

    if (userId && prompt.userId !== userId) {
      throw new ForbiddenError('You do not have access to this prompt');
    }

    return prompt;
  }

  async update(
    promptId: string,
    userId: string,
    input: UpdatePromptInput
  ): Promise<Prompt> {
    const prompt = await this.findById(promptId, userId);

    Object.assign(prompt, {
      ...input,
      tags: input.tags?.filter((tag): tag is string => tag !== undefined),
    });

    await this.promptRepository.save(prompt);
    logger.info(`Prompt updated: ${promptId}`);

    return prompt;
  }

  async delete(promptId: string, userId: string): Promise<void> {
    const prompt = await this.findById(promptId, userId);
    await this.promptRepository.remove(prompt);
    logger.info(`Prompt deleted: ${promptId}`);
  }

  async toggleFavorite(promptId: string, userId: string): Promise<Prompt> {
    const prompt = await this.findById(promptId, userId);
    prompt.isFavorite = !prompt.isFavorite;
    await this.promptRepository.save(prompt);
    return prompt;
  }

  async incrementUsageCount(promptId: string): Promise<void> {
    await this.promptRepository.increment({ id: promptId }, 'usageCount', 1);
  }

  async archive(promptId: string, userId: string): Promise<Prompt> {
    const prompt = await this.findById(promptId, userId);
    prompt.status = PromptStatus.ARCHIVED;
    await this.promptRepository.save(prompt);
    return prompt;
  }

  async restore(promptId: string, userId: string): Promise<Prompt> {
    const prompt = await this.findById(promptId, userId);
    prompt.status = PromptStatus.ACTIVE;
    await this.promptRepository.save(prompt);
    return prompt;
  }

  async duplicate(promptId: string, userId: string): Promise<Prompt> {
    const original = await this.findById(promptId, userId);

    const duplicate = this.promptRepository.create({
      title: `${original.title} (Copy)`,
      content: original.content,
      negativePrompt: original.negativePrompt,
      description: original.description,
      category: original.category,
      tags: original.tags,
      settings: original.settings,
      userId,
    });

    await this.promptRepository.save(duplicate);
    logger.info(`Prompt duplicated: ${promptId} -> ${duplicate.id}`);

    return duplicate;
  }

  async getCategories(): Promise<{ category: string; count: number }[]> {
    const result = await this.promptRepository
      .createQueryBuilder('prompt')
      .select('prompt.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('prompt.category')
      .getRawMany();

    return result;
  }

  async getUserStats(userId: string): Promise<{
    totalPrompts: number;
    favoriteCount: number;
    categoryCounts: Record<string, number>;
  }> {
    const totalPrompts = await this.promptRepository.count({
      where: { userId, status: PromptStatus.ACTIVE },
    });

    const favoriteCount = await this.promptRepository.count({
      where: { userId, isFavorite: true, status: PromptStatus.ACTIVE },
    });

    const categoryResults = await this.promptRepository
      .createQueryBuilder('prompt')
      .select('prompt.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('prompt.userId = :userId', { userId })
      .andWhere('prompt.status = :status', { status: PromptStatus.ACTIVE })
      .groupBy('prompt.category')
      .getRawMany();

    const categoryCounts: Record<string, number> = {};
    categoryResults.forEach((r) => {
      categoryCounts[r.category] = parseInt(r.count, 10);
    });

    return { totalPrompts, favoriteCount, categoryCounts };
  }
}

export default new PromptService();


