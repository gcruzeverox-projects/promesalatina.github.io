// apps/api/src/storage/cloudinary.service.ts
// Servicio de subida y eliminación de imágenes en Cloudinary
// Las imágenes se comprimen y optimizan automáticamente en Cloudinary

import { Injectable, OnModuleInit } from '@nestjs/common'
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'
import { Readable } from 'stream'

@Injectable()
export class CloudinaryService implements OnModuleInit {

  onModuleInit() {
    cloudinary.config({
      cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
      api_key:     process.env.CLOUDINARY_API_KEY,
      api_secret:  process.env.CLOUDINARY_API_SECRET,
    })
  }

  /**
   * Sube un buffer de imagen a Cloudinary.
   * Aplica transformaciones automáticas: resize a 900px, calidad auto, formato auto.
   * Retorna la URL segura (https) y el publicId para eliminación futura.
   */
  async uploadProductImage(
    buffer: Buffer,
    originalName: string,
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const safeName = originalName
        .replace(/\.[^.]+$/, '')
        .replace(/[^a-z0-9_-]/gi, '-')
        .toLowerCase()
        .slice(0, 60)

      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'promesa-latina/products',
          public_id: `${Date.now()}-${safeName}`,
          transformation: [
            { width: 900, height: 900, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error('Cloudinary upload failed'))
          } else {
            resolve({ url: result.secure_url, publicId: result.public_id })
          }
        },
      )

      Readable.from(buffer).pipe(stream)
    })
  }

  /**
   * Elimina una imagen de Cloudinary por su publicId.
   * Llamar siempre que se borre una ProductImage de la BD.
   */
  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId)
  }

  /**
   * Genera una URL con transformación dinámica.
   * Útil para thumbnails en el panel admin (300×300) sin re-subir.
   */
  buildThumbnailUrl(publicId: string, size = 300): string {
    return cloudinary.url(publicId, {
      width:       size,
      height:      size,
      crop:        'fill',
      quality:     'auto',
      fetch_format:'auto',
      secure:      true,
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────────

// apps/api/src/storage/storage.module.ts
import { Module } from '@nestjs/common'

@Module({
  providers: [CloudinaryService],
  exports:   [CloudinaryService],
})
export class StorageModule {}
