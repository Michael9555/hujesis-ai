import { Response, NextFunction } from 'express';
import promptService from './prompt.service';
import { sendSuccess, sendPaginated } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth';
import { PromptQueryInput } from './prompt.schema';

export class PromptController {
  async create(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new Error('User not found');
      const prompt = await promptService.create(req.user.id, req.body);
      sendSuccess(res, prompt, 201, 'Prompt created successfully');
    } catch (error) {
      next(error);
    }
  }

  async findAll(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new Error('User not found');
      const query = req.query as unknown as PromptQueryInput;
      const result = await promptService.findAll(req.user.id, query);
      sendPaginated(
        res,
        result.data,
        result.page,
        result.limit,
        result.total
      );
    } catch (error) {
      next(error);
    }
  }

  async findById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new Error('User not found');
      const prompt = await promptService.findById(req.params.id, req.user.id);
      sendSuccess(res, prompt);
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new Error('User not found');
      const prompt = await promptService.update(
        req.params.id,
        req.user.id,
        req.body
      );
      sendSuccess(res, prompt, 200, 'Prompt updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new Error('User not found');
      await promptService.delete(req.params.id, req.user.id);
      sendSuccess(res, null, 200, 'Prompt deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async toggleFavorite(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new Error('User not found');
      const prompt = await promptService.toggleFavorite(
        req.params.id,
        req.user.id
      );
      sendSuccess(res, prompt, 200, 'Favorite toggled successfully');
    } catch (error) {
      next(error);
    }
  }

  async archive(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new Error('User not found');
      const prompt = await promptService.archive(req.params.id, req.user.id);
      sendSuccess(res, prompt, 200, 'Prompt archived successfully');
    } catch (error) {
      next(error);
    }
  }

  async restore(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new Error('User not found');
      const prompt = await promptService.restore(req.params.id, req.user.id);
      sendSuccess(res, prompt, 200, 'Prompt restored successfully');
    } catch (error) {
      next(error);
    }
  }

  async duplicate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new Error('User not found');
      const prompt = await promptService.duplicate(req.params.id, req.user.id);
      sendSuccess(res, prompt, 201, 'Prompt duplicated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getStats(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new Error('User not found');
      const stats = await promptService.getUserStats(req.user.id);
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }
}

export default new PromptController();


