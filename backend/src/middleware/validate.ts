import { Request, Response, NextFunction } from "express";
import { AnySchema, ValidationError as YupValidationError } from "yup";
import { ValidationError } from "../utils/errors";

interface ValidateOptions {
  body?: AnySchema;
  query?: AnySchema;
  params?: AnySchema;
}

export const validate = (schemas: ValidateOptions) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const errors: Record<string, string[]> = {};

      if (schemas.body) {
        try {
          req.body = await schemas.body.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
          });
        } catch (err) {
          if (err instanceof YupValidationError) {
            err.inner.forEach((e) => {
              const path = e.path || "body";
              if (!errors[path]) {
                errors[path] = [];
              }
              errors[path].push(e.message);
            });
          } else {
            throw err;
          }
        }
      }

      if (schemas.query) {
        try {
          req.query = await schemas.query.validate(req.query, {
            abortEarly: false,
            stripUnknown: true,
          });
        } catch (err) {
          if (err instanceof YupValidationError) {
            err.inner.forEach((e) => {
              const path = e.path ? `query.${e.path}` : "query";
              if (!errors[path]) {
                errors[path] = [];
              }
              errors[path].push(e.message);
            });
          } else {
            throw err;
          }
        }
      }

      if (schemas.params) {
        try {
          req.params = await schemas.params.validate(req.params, {
            abortEarly: false,
            stripUnknown: true,
          });
        } catch (err) {
          if (err instanceof YupValidationError) {
            err.inner.forEach((e) => {
              const path = e.path ? `params.${e.path}` : "params";
              if (!errors[path]) {
                errors[path] = [];
              }
              errors[path].push(e.message);
            });
          } else {
            throw err;
          }
        }
      }

      if (Object.keys(errors).length > 0) {
        throw new ValidationError("Validation failed", errors);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
