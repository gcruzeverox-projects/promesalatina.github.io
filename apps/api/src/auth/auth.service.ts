// apps/api/src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class AuthService {
  constructor(
    private prisma:  PrismaService,
    private jwt:     JwtService,
  ) {}

  async register(dto: { name: string; email: string; password: string; businessName?: string; phone?: string }) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (exists) throw new ConflictException('El correo ya está registrado')

    const hash = await bcrypt.hash(dto.password, 12)
    const user = await this.prisma.user.create({
      data: { ...dto, password: hash },
    })

    const { password: _, ...safe } = user
    return { user: safe, access_token: this.signToken(user) }
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) throw new UnauthorizedException('Credenciales incorrectas')

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw new UnauthorizedException('Credenciales incorrectas')

    if (!user.isActive) throw new UnauthorizedException('Cuenta desactivada')

    const { password: _, ...safe } = user
    return { user: safe, access_token: this.signToken(user) }
  }

  private signToken(user: { id: string; email: string; role: string }) {
    return this.jwt.sign({ sub: user.id, email: user.email, role: user.role })
  }
}

// ─────────────────────────────────────────────────────────────────────────────

// apps/api/src/auth/auth.controller.ts
import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './guards/jwt-auth.guard'

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: { name: string; email: string; password: string; businessName?: string; phone?: string }) {
    return this.auth.register(dto)
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Request() req: any) {
    return req.user
  }
}
