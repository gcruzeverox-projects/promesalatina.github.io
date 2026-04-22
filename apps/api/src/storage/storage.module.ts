// apps/api/src/storage/storage.module.ts
import { Module } from '@nestjs/common'
import { CloudinaryService } from './cloudinary.service'

@Module({
  providers: [CloudinaryService],
  exports:   [CloudinaryService],
})
export class StorageModule {}
