// apps/api/src/products/products.module.ts
import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { ProductsController } from './products.controller'
import { ProductsService } from './products.service'
import { PrismaModule } from '../prisma/prisma.module'
import { StorageModule } from '../storage/storage.module'

@Module({
  imports: [
    PrismaModule,
    StorageModule,
    MulterModule.register({
      storage: memoryStorage(),   // buffer en memoria para pasar a Cloudinary
    }),
  ],
  controllers: [ProductsController],
  providers:   [ProductsService],
  exports:     [ProductsService],
})
export class ProductsModule {}
