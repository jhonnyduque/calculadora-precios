// src/auth/auth.refresh.controller.ts
/**
 * Controller HTTP para refresh de tokens.
 * Responsabilidades:
 * - Traducir HTTP <-> dominio
 * - Extraer refresh token del body (o cookie en el futuro)
 * - Delegar lógica a AuthRefreshService
 * - Responder de forma consistente
 */
import { Request, Response } from 'express';
import { AuthRefreshService } from './auth.refresh.service';
import { AuthResponse } from './auth.types';
import { toAuthError } from './auth.errors';

export class AuthRefreshController {
  constructor(
    private readonly refreshService: AuthRefreshService
  ) {}

  /**
   * POST /auth/refresh
   * Emite un nuevo access token usando un refresh token válido.
   */
  async refresh(req: Request, res: Response<AuthResponse>): Promise<void> {
    try {
      const refreshToken = String(req.body?.refreshToken ?? '').trim();

      const tokens = await this.refreshService.refresh(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: tokens,
      });
    } catch (error) {
      const authError = toAuthError(error);

      if (process.env.NODE_ENV !== 'production') {
        console.error('[AuthRefreshController.refresh]', {
          code: authError.code,
          message: authError.message,
          details: authError.details,
          stack: error instanceof Error ? error.stack : undefined,
        });
      }

      res.status(authError.httpStatus).json({
        success: false,
        error: authError.message,
        code: authError.code,
        ...(authError.details && { details: authError.details }),
      });
    }
  }
}
