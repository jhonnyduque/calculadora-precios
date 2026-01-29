// src/auth/auth.types.ts
import { Request } from 'express';

// ============================================================================
// DTOs de entrada
// ============================================================================

/**
 * Datos enviados por el frontend para login
 */
export interface LoginDTO {
  identifier: string; // email o username
  password: string;
}

// ============================================================================
// Tokens de autenticación
// ============================================================================

/**
 * Par de tokens emitidos por el sistema de auth
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ============================================================================
// Payloads JWT
// ============================================================================

/**
 * Payload del access token
 */
export interface AccessTokenPayload {
  sub: string; // userId
  iat?: number;
  exp?: number;
}

/**
 * Payload del refresh token
 */
export interface RefreshTokenPayload {
  sub: string;           // userId
  tokenVersion?: number;
  iat?: number;
  exp?: number;
}

// ============================================================================
// Request autenticado (para middlewares y controllers)
// ============================================================================

export interface AuthenticatedRequest extends Request {
  auth: {
    userId: string;
  };
}

// ============================================================================
// Respuesta estándar del módulo auth
// ============================================================================

export interface AuthResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: string;
  details?: Record<string, unknown>;
}
