// apps/api/src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

export const Roles = (...roles: string[]) => SetMetadata('roles', roles)

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ])
    if (!required || required.length === 0) return true
    const { user } = context.switchToHttp().getRequest()
    return required.includes(user?.role)
  }
}
