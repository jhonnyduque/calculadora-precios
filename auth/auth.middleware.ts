// src/auth/auth.middleware.ts
/**
 * Middleware de autenticación JWT (solo access token).
 * Responsabilidades:
 * - Extraer token Bearer del header Authorization
 * - Validar firma, expiración y payload
 * - Adjuntar contexto de usuario autenticado a req.auth
 * - Delegar errores tipados al handler global
 *
 * Diseño:
 * - Agnóstico a framework (Express)
 * - Usa errores del dominio (AuthErrors)
 * - Sin lógica de negocio
 * - Preparado para refresh token en otro middleware
 */
import { Request, Response, NextFunction } from 'express';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AuthErrors } from './auth.errors';
import { JWT_ACCESS_TOKEN_SECRET } from './auth.constants';
import { AuthenticatedRequest, AccessTokenPayload } from './auth.types';

// ============================================================================
// Guard de configuración (fail fast en startup)
// ============================================================================
if (!JWT_ACCESS_TOKEN_SECRET) {
  throw AuthErrors.misconfigured({
    reason: 'JWT_ACCESS_TOKEN_SECRET no definido en .env',
  });
}

// ============================================================================
// Middleware principal
// ============================================================================

/**
 * Protege rutas que requieren autenticación JWT.
 * - Lanza AuthError si falla
 * - Adjunta req.auth.userId si pasa
 * - Delega errores al error handler global
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      throw AuthErrors.missingToken({
        reason: 'authorization_header_missing_or_invalid',
      });
    }

    let payload: AccessTokenPayload;

    try {
      // Verificación segura con tipado estricto
      payload = jwt.verify(token, JWT_ACCESS_TOKEN_SECRET) as AccessTokenPayload;
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw AuthErrors.expiredToken({
          reason: 'access_token_expired',
          details: { expiredAt: err.expiredAt?.toISOString() },
        });
      }

      if (err instanceof JsonWebTokenError) {
        throw AuthErrors.invalidToken({
          reason: 'jwt_verification_failed',
          details: {
            jwt_error_message: err.message,
            jwt_error_name: err.name,
          },
        });
      }

      throw AuthErrors.invalidToken({
        reason: 'unknown_jwt_error',
        details: {
          error_type: err instanceof Error ? err.name : 'unknown',
        },
      });
    }

    if (!payload.sub) {
      throw AuthErrors.invalidToken({
        reason: 'missing_subject_claim',
      });
    }

    // Adjuntar contexto autenticado (tipado seguro)
    (req as AuthenticatedRequest).auth = {
      userId: payload.sub,
    };

    next();
  } catch (error) {
    // Delegar al error handler global (no responder aquí)
    next(error);
  }
}

// ============================================================================
// Helpers privados
// ============================================================================

/**
 * Extrae token Bearer del header Authorization.
 * @returns token limpio o null si no existe o formato inválido
 */
function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;

  // Chequeo estricto de tipo y formato
  if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7).trim(); // Quita "Bearer " y espacios

  // Evitar tokens vacíos o solo espacios
  return token.length > 0 ? token : null;
}