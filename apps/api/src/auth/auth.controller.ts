// apps/api/src/auth/auth.controller.ts
import { Controller, Post, Body, Get, Put, Patch, UseGuards, Request, Param } from '@nestjs/common'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './guards/jwt-auth.guard'

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: {
    name: string
    email: string
    password: string
    businessName?: string
    phone?: string
  }) {
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

  @Get('users')
  @UseGuards(JwtAuthGuard)
  getUsers() {
    return this.auth.findAllUsers()
  }

  @Put('users/:id')
  @UseGuards(JwtAuthGuard)
  updateUser(@Param('id') id: string, @Body() dto: any) {
    return this.auth.updateUser(id, dto)
  }

  @Patch('users/:id/toggle')
  @UseGuards(JwtAuthGuard)
  toggleUser(@Param('id') id: string) {
    return this.auth.toggleUserStatus(id)
  }
}
