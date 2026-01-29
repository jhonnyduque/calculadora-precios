// src/auth/auth.service.ts
/**
 * Servicio principal de autenticación (login) con JWT.
 * Responsabilidades:
 * - Validar credenciales contra repositorio
 * - Generar access token + refresh token
 * - Usar errores de dominio tipados (AuthErrors)
 * - Agnóstico a framework
 */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthErrors } from './auth.errors';
import { LoginDTO, AuthTokens } from './auth.types';
import {
  JWT_ACCESS_TOKEN_EXPIRES_IN,
  JWT_REFRESH_TOKEN_EXPIRES_IN,
  JWT_ACCESS_TOKEN_SECRET,
  JWT_REFRESH_TOKEN_SECRET,
} from './auth.constants';

// ============================================================================
// Contrato mínimo del repositorio de usuarios
// ============================================================================
export interface AuthUser {
  id: string;
  passwordHash: string;
  isActive: boolean;
  tokenVersion?: number;
}

export interface UserRepository {
  findByIdentifier(identifier: string): Promise<AuthUser | null>;
  // Futuro: método para invalidar tokens (incrementar version)
  // incrementTokenVersion?(userId: string): Promise<void>;
}

// ============================================================================
// Servicio
// ============================================================================
export class AuthService {
  constructor(private readonly userRepo: UserRepository) {
    // Fail fast: configuración JWT obligatoria
    if (
      !JWT_ACCESS_TOKEN_SECRET ||
      !JWT_REFRESH_TOKEN_SECRET ||
      !JWT_ACCESS_TOKEN_EXPIRES_IN ||
      !JWT_REFRESH_TOKEN_EXPIRES_IN
    ) {
      throw AuthErrors.misconfigured({
        reason: 'JWT configuration incomplete (secrets or expiresIn missing)',
      });
    }
  }

  /**
   * Autentica al usuario y genera tokens JWT.
   * @throws AuthError con códigos de dominio si falla
   */
  async login(input: LoginDTO): Promise<AuthTokens> {
    const identifier = input.identifier?.trim();
    const password = input.password?.trim();

    // Validación temprana de input
    if (!identifier || !password) {
      throw AuthErrors.missingCredentials({
        details: { missing: !identifier ? 'identifier' : 'password' },
      });
    }

    // Buscar usuario (seguridad: no revelar existencia ni estado)
    const user = await this.userRepo.findByIdentifier(identifier);

    // Seguridad: misma respuesta para inexistente, inactivo o contraseña mala
    if (!user || !user.isActive) {
      throw AuthErrors.invalidCredentials();
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw AuthErrors.invalidCredentials();
    }

    // Generar access token (corto)
    const accessToken = jwt.sign(
      { sub: user.id } satisfies { sub: string },
      JWT_ACCESS_TOKEN_SECRET,
      { expiresIn: JWT_ACCESS_TOKEN_EXPIRES_IN }
    );

    // Generar refresh token (largo + versionado para revoke/rotación)
    const refreshToken = jwt.sign(
      {
        sub: user.id,
        tokenVersion: user.tokenVersion ?? 0,
      } satisfies { sub: string; tokenVersion: number },
      JWT_REFRESH_TOKEN_SECRET,
      { expiresIn: JWT_REFRESH_TOKEN_EXPIRES_IN }
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Invalida todos los tokens de un usuario (incrementa tokenVersion).
   * Usar en: logout, cambio de contraseña, revoke de sesión, etc.
   * Actualmente sin efecto: requiere soporte en UserRepository.
   */
  async invalidateUserTokens(userId: string): Promise<void> {
    // TODO: implementar cuando tengas el método en UserRepository
    // await this.userRepo.incrementTokenVersion(userId);
    // Opcional: emitir evento de dominio para auditoría / notificación
    // await eventBus.publish('AUTH_TOKENS_INVALIDATED', { userId, timestamp });
  }
}