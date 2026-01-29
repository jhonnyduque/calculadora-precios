// src/auth/auth.constants.ts

/**
 * Constantes centralizadas del módulo de autenticación.
 *
 * Principios:
 * - Una sola fuente de verdad
 * - Sin strings mágicos
 * - Dominio desacoplado de Express
 * - Preparado para refresh, revoke y cookies
 */

// ============================================================================
// JWT – Secrets y expiraciones
// ============================================================================

/**
 * Secret para firmar ACCESS tokens (corto plazo)
 */
export const JWT_ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_TOKEN_SECRET;

/**
 * Secret para firmar REFRESH tokens (largo plazo)
 */
export const JWT_REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_TOKEN_SECRET;

/**
 * Expiración del access token
 * Recomendado: 15m – 1h – 1d (según criticidad)
 */
export const JWT_ACCESS_TOKEN_EXPIRES_IN =
  process.env.JWT_ACCESS_TOKEN_EXPIRES_IN ?? '1d';

/**
 * Expiración del refresh token
 */
export const JWT_REFRESH_TOKEN_EXPIRES_IN =
  process.env.JWT_REFRESH_TOKEN_EXPIRES_IN ?? '7d';

// ============================================================================
// Headers y cookies
// ============================================================================

export const AUTH_HEADER_NAME = 'Authorization';
export const BEARER_PREFIX = 'Bearer ';

/**
 * Cookie preparada para auth basada en cookies (fase futura)
 */
export const AUTH_COOKIE_NAME = 'auth_token';

// ============================================================================
// Errores del dominio auth
// ============================================================================

export const AUTH_ERROR_CODES = {
  // Infraestructura
  MISCONFIGURED: 'AUTH_MISCONFIGURED',
  INTERNAL_ERROR: 'AUTH_INTERNAL_ERROR',

  // Input
  MISSING_CREDENTIALS: 'AUTH_MISSING_CREDENTIALS',

  // Autenticación
  INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  MISSING_TOKEN: 'AUTH_MISSING_TOKEN',
  INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
  EXPIRED_TOKEN: 'AUTH_EXPIRED_TOKEN',
  REFRESH_TOKEN_INVALID: 'AUTH_REFRESH_TOKEN_INVALID',

  // Autorización
  FORBIDDEN: 'AUTH_FORBIDDEN',
} as const;

// ============================================================================
// Mensajes estándar
// ============================================================================

export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: 'Inicio de sesión exitoso',
  LOGOUT_SUCCESS: 'Sesión cerrada correctamente',
} as const;

// ============================================================================
// Guardas de seguridad (fail fast)
// ============================================================================

if (!JWT_ACCESS_TOKEN_SECRET || !JWT_REFRESH_TOKEN_SECRET) {
  throw new Error(
    '[AUTH] JWT secrets missing. ' +
    'Define JWT_ACCESS_TOKEN_SECRET y JWT_REFRESH_TOKEN_SECRET en .env'
  );
}
