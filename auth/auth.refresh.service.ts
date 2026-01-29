// src/auth/auth.refresh.service.ts
/**
 * Servicio dedicado al refresh de tokens JWT.
 * Responsabilidades:
 * - Validar refresh token
 * - Verificar versión del token (revocación)
 * - Emitir nuevo access token
 * - Preparado para rotación futura
 */
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AuthErrors } from './auth.errors';
import {
  JWT_ACCESS_TOKEN_EXPIRES_IN,
  JWT_ACCESS_TOKEN_SECRET,
  JWT_REFRESH_TOKEN_SECRET,
} from './auth.constants';
import { UserRepository } from './auth.service';
import { RefreshTokenPayload, AuthTokens } from './auth.types';

export class AuthRefreshService {
  constructor(private readonly userRepo: UserRepository) {
    // Fail fast: configuración obligatoria
    if (!JWT_ACCESS_TOKEN_SECRET || !JWT_REFRESH_TOKEN_SECRET) {
      throw AuthErrors.misconfigured({
        reason: 'JWT secrets missing for refresh flow',
      });
    }
  }

  /**
   * Valida refresh token y emite un nuevo access token.
   * @throws AuthError si el refresh token es inválido o revocado
   */
  async refresh(refreshToken?: string): Promise<AuthTokens> {
    const token = refreshToken?.trim();

    if (!token) {
      throw AuthErrors.refreshTokenInvalid({
        reason: 'refresh_token_missing',
      });
    }

    let payload: RefreshTokenPayload;

    try {
      payload = jwt.verify(
        token,
        JWT_REFRESH_TOKEN_SECRET
      ) as RefreshTokenPayload;
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw AuthErrors.expiredToken({
          reason: 'refresh_token_expired',
        });
      }

      if (err instanceof JsonWebTokenError) {
        throw AuthErrors.refreshTokenInvalid({
          reason: 'refresh_token_invalid',
        });
      }

      throw AuthErrors.refreshTokenInvalid({
        reason: 'unknown_refresh_error',
      });
    }

    const { sub: userId, tokenVersion } = payload;

    if (!userId) {
      throw AuthErrors.refreshTokenInvalid({
        reason: 'missing_subject_claim',
      });
    }

    // 🔐 Validar estado actual del usuario y versión del token
    const user = await this.userRepo.findById(userId);

    if (!user || user.tokenVersion !== tokenVersion) {
      throw AuthErrors.refreshTokenInvalid({
        reason: 'token_version_mismatch',
      });
    }

    // ✅ Emitir nuevo access token (secret correcto)
    const accessToken = jwt.sign(
      { sub: user.id },
      JWT_ACCESS_TOKEN_SECRET,
      { expiresIn: JWT_ACCESS_TOKEN_EXPIRES_IN }
    );

    return {
      accessToken,
      refreshToken: token, // misma refresh (rotación se activa en fase futura)
    };
  }
}
