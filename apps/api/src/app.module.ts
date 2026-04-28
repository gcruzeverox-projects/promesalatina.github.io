// apps/api/src/app.module.ts
// Módulo raíz — registra todos los módulos del proyecto.
// ACTUALIZADO: incluye QuotesModule.

import { Module } from '@nestjs/common'
import { ConfigModule }     from '@nestjs/config'
import { PrismaModule }     from './prisma/prisma.module'
import { AuthModule }       from './auth/auth.module'
import { ProductsModule }   from './products/products.module'
import { CategoriesModule } from './categories/categories.module'
import { OrdersModule }     from './orders/orders.module'
import { QuotesModule }     from './quotes/quotes.module'   // ← NUEVO
import { EmailModule }      from './email/email.module'
import { StorageModule }    from './storage/storage.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StorageModule,
    EmailModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    QuotesModule,   // ← NUEVO
  ],
})
export class AppModule {}
