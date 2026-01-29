// src/auth/auth.controller.ts
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDTO, AuthResponse, AuthenticatedRequest } from './auth.types';
import { AuthErrors, toAuthError } from './auth.errors';
import { AUTH_MESSAGES } from './auth.constants';

/**
 * Controlador de autenticación.
 * - Traduce HTTP <-> dominio
 * - Sin lógica de negocio
 * - Respuestas y errores consistentes
 */
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login
   */
  async login(
    req: Request<unknown, unknown, Partial<LoginDTO>>,
    res: Response<AuthResponse>
  ): Promise<void> {
    try {
      const { identifier, password } = this.normalizeLoginInput(req.body);

      if (!identifier || !password) {
        throw AuthErrors.missingCredentials({
          details: { missing: !identifier ? 'identifier' : 'password' },
        });
      }

      const tokens = await this.authService.login({ identifier, password });

      this.sendSuccess(res, {
        success: true,
        message: AUTH_MESSAGES.LOGIN_SUCCESS,
        data: tokens,
      });
    } catch (error) {
      const authError = toAuthError(error);
      this.logError('login', authError, error);
      this.sendError(res, authError);
    }
  }

  /**
   * GET /auth/me
   */
  async me(
    req: AuthenticatedRequest,
    res: Response<AuthResponse>
  ): Promise<void> {
    try {
      this.sendSuccess(res, {
        success: true,
        message: 'Perfil obtenido correctamente',
        data: {
          userId: req.auth.userId,
        },
      });
    } catch (error) {
      const authError = toAuthError(error);
      this.logError('me', authError, error);
      this.sendError(res, authError);
    }
  }

  // --------------------------------------------------------------------------
  // Helpers privados (controller-only)
  // --------------------------------------------------------------------------

  private normalizeLoginInput(body?: Partial<LoginDTO>): LoginDTO {
    return {
      identifier: String(body?.identifier ?? '').trim(),
      password: String(body?.password ?? '').trim(),
    };
  }

  private sendSuccess(res: Response<AuthResponse>, payload: AuthResponse): void {
    res.status(200).json(payload);
  }

  private sendError(res: Response<AuthResponse>, error: ReturnType<typeof toAuthError>): void {
    res.status(error.httpStatus).json({
      success: false,
      error: error.message,
      code: error.code,
      ...(error.details && { details: error.details }),
    });
  }

  private logError(
    context: 'login' | 'me',
    authError: ReturnType<typeof toAuthError>,
    original: unknown
  ): void {
    if (process.env.NODE_ENV === 'production') return;

    console.error(`[AuthController.${context}]`, {
      code: authError.code,
      message: authError.message,
      details: authError.details,
      stack: original instanceof Error ? original.stack : undefined,
    });
  }
}
