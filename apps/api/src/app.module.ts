// apps/api/src/app.module.ts
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule }    from './prisma/prisma.module'
import { AuthModule }      from './auth/auth.module'
import { ProductsModule }  from './products/products.module'
import { CategoriesModule } from './categories/categories.module'
import { OrdersModule }    from './orders/orders.module'
import { EmailModule }     from './email/email.module'
import { StorageModule }   from './storage/storage.module'

@Module({
  imports: [
    // Variables de entorno disponibles en toda la app
    ConfigModule.forRoot({ isGlobal: true }),

    // Infraestructura
    PrismaModule,
    StorageModule,
    EmailModule,

    // Dominio
    AuthModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
  ],
})
export class AppModule {}
