// apps/api/src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt:    JwtService,
  ) {}

  async register(dto: {
    name: string
    email: string
    password: string
    businessName?: string
    phone?: string
  }) {
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
