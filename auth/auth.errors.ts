// src/auth/auth.errors.ts
/**
 * Errores de dominio para el módulo de autenticación.
 * Responsabilidades:
 * - Definir errores tipados y consistentes
 * - Separar dominio de HTTP
 * - Centralizar códigos, mensajes y detalles
 * - Facilitar i18n, testing y observabilidad
 */
import { AUTH_ERROR_CODES } from './auth.constants';

// ============================================================================
// Tipos base
// ============================================================================

export type AuthErrorDetails = Readonly<
  Record<string, string | number | boolean | null>
>;

export interface AuthErrorShape {
  code: string;
  message: string;
  httpStatus: number;
  details?: AuthErrorDetails;
  cause?: unknown;
}

// ============================================================================
// Clase base de error de dominio
// ============================================================================

export class AuthError extends Error {
  readonly code: string;
  readonly httpStatus: number;
  readonly details?: AuthErrorDetails;

  constructor(shape: AuthErrorShape) {
    super(shape.message, { cause: shape.cause });
    this.name = shape.code; // 🔹 name expresivo para logs y stack traces
    this.code = shape.code;
    this.httpStatus = shape.httpStatus;
    this.details = shape.details;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ============================================================================
// Factoría de errores de dominio (API pública)
// ============================================================================

export const AuthErrors = {
  // Configuración / infraestructura
  misconfigured(details?: AuthErrorDetails): AuthError {
    return new AuthError({
      code: AUTH_ERROR_CODES.MISCONFIGURED,
      message: 'Authentication system misconfigured',
      httpStatus: 500,
      details,
    });
  },

  // Input
  missingCredentials(details?: AuthErrorDetails): AuthError {
    return new AuthError({
      code: AUTH_ERROR_CODES.MISSING_CREDENTIALS,
      message: 'Missing credentials',
      httpStatus: 400,
      details,
    });
  },

  // Autenticación
  invalidCredentials(details?: AuthErrorDetails): AuthError {
    return new AuthError({
      code: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
      message: 'Invalid credentials',
      httpStatus: 401,
      details,
    });
  },

  missingToken(details?: AuthErrorDetails): AuthError {
    return new AuthError({
      code: AUTH_ERROR_CODES.MISSING_TOKEN,
      message: 'Authentication token missing',
      httpStatus: 401,
      details,
    });
  },

  invalidToken(details?: AuthErrorDetails): AuthError {
    return new AuthError({
      code: AUTH_ERROR_CODES.INVALID_TOKEN,
      message: 'Invalid authentication token',
      httpStatus: 401,
      details,
    });
  },

  expiredToken(details?: AuthErrorDetails): AuthError {
    return new AuthError({
      code: AUTH_ERROR_CODES.EXPIRED_TOKEN,
      message: 'Authentication token expired',
      httpStatus: 401,
      details,
    });
  },

  refreshTokenInvalid(details?: AuthErrorDetails): AuthError {
    return new AuthError({
      code: AUTH_ERROR_CODES.REFRESH_TOKEN_INVALID,
      message: 'Invalid refresh token',
      httpStatus: 401,
      details,
    });
  },

  // Autorización
  forbidden(details?: AuthErrorDetails): AuthError {
    return new AuthError({
      code: AUTH_ERROR_CODES.FORBIDDEN,
      message: 'Access denied (insufficient permissions)',
      httpStatus: 403,
      details,
    });
  },
} as const;

// ============================================================================
// Normalizador de errores (boundary HTTP / logging)
// ============================================================================

/**
 * Convierte cualquier error en un AuthError seguro y tipado.
 * Nunca filtra mensajes internos al cliente.
 */
export function toAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) {
    return error;
  }

  if (error instanceof Error) {
    return new AuthError({
      code: AUTH_ERROR_CODES.INTERNAL_ERROR,
      message: 'Unexpected authentication error',
      httpStatus: 500,
      cause: error, // 🔹 preserva contexto para logging/observabilidad
    });
  }

  return new AuthError({
    code: AUTH_ERROR_CODES.INTERNAL_ERROR,
    message: 'Unexpected authentication error',
    httpStatus: 500,
  });
}
