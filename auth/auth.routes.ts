// src/auth/auth.routes.ts
import { Router, Request, Response } from 'express';
import { AuthService, UserRepository } from './auth.service';
import { AuthController } from './auth.controller';
import { requireAuth } from './auth.middleware';
import { AuthenticatedRequest, AuthResponse } from './auth.types';
import { asyncHandler } from '../utils/async-handler';

export function createAuthRouter(userRepository: UserRepository): Router {
  const router = Router();

  const authService = new AuthService(userRepository);
  const authController = new AuthController(authService);

  // Rutas públicas
  router.post(
    '/login',
    asyncHandler((req: Request, res: Response<AuthResponse>) =>
      authController.login(req, res)
    )
  );

  // Rutas protegidas
  router.get(
    '/me',
    requireAuth,
    asyncHandler((req: AuthenticatedRequest, res: Response<AuthResponse>) =>
      authController.me(req, res)
    )
  );

  return router;
}
