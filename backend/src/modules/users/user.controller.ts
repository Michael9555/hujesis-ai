import { Response, NextFunction } from "express";
import userService from "./user.service";
import { sendSuccess } from "../../utils/response";
import { AuthenticatedRequest } from "../../middleware/auth";

export class UserController {
  async getProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new Error("User not found");
      sendSuccess(res, req.user.toJSON());
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new Error("User not found");
      const user = await userService.updateProfile(req.user.id, req.body);
      sendSuccess(res, user.toJSON(), 200, "Profile updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async getDashboard(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new Error("User not found");
      const stats = await userService.getDashboardStats(req.user.id);
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) throw new Error("User not found");
      await userService.delete(req.user.id);
      sendSuccess(res, null, 200, "Account deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
