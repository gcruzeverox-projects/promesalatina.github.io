// apps/api/src/prisma/prisma.service.ts
// Singleton de Prisma Client para NestJS
// Gestiona la conexión al inicio y el cierre limpio al apagar el servidor

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    })
  }

  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}

// ─────────────────────────────────────────────────────────────────────────────

// apps/api/src/prisma/prisma.module.ts
import { Module, Global } from '@nestjs/common'

@Global()   // disponible en todos los módulos sin importar explícitamente
@Module({
  providers: [PrismaService],
  exports:   [PrismaService],
})
export class PrismaModule {}
