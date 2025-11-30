import { Response, NextFunction } from "express";
import imageService from "./image.service";
import { sendSuccess, sendPaginated } from "../../utils/response";
import { AuthenticatedRequest } from "../../middleware/auth";
import { ImageQueryInput } from "./image.schema";

export class ImageController {
  async generate(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new Error("User not found");
      const image = await imageService.generate(req.user.id, req.body);
      sendSuccess(res, image, 201, "Image generation started");
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
      if (!req.user) throw new Error("User not found");
      const query = req.query as unknown as ImageQueryInput;
      const result = await imageService.findAll(req.user.id, query);
      sendPaginated(res, result.data, result.page, result.limit, result.total);
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
      if (!req.user) throw new Error("User not found");
      const image = await imageService.findById(req.params.id, req.user.id);
      sendSuccess(res, image);
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
      if (!req.user) throw new Error("User not found");
      const image = await imageService.update(
        req.params.id,
        req.user.id,
        req.body
      );
      sendSuccess(res, image, 200, "Image updated successfully");
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
      if (!req.user) throw new Error("User not found");
      await imageService.delete(req.params.id, req.user.id);
      sendSuccess(res, null, 200, "Image deleted successfully");
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
      if (!req.user) throw new Error("User not found");
      const image = await imageService.toggleFavorite(
        req.params.id,
        req.user.id
      );
      sendSuccess(res, image, 200, "Favorite toggled successfully");
    } catch (error) {
      next(error);
    }
  }

  async bulkDelete(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new Error("User not found");
      const { ids } = req.body;
      const deletedCount = await imageService.bulkDelete(ids, req.user.id);
      sendSuccess(res, { deletedCount }, 200, `${deletedCount} images deleted`);
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
      if (!req.user) throw new Error("User not found");
      const stats = await imageService.getUserStats(req.user.id);
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }
}

export default new ImageController();
