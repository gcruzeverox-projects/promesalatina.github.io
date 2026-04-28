// apps/api/src/storage/cloudinary.service.ts
// Servicio Cloudinary extendido con soporte para subida de PDFs (raw).

import { Injectable, OnModuleInit } from '@nestjs/common'
import { v2 as cloudinary } from 'cloudinary'
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

  // ── Subir imagen de producto ───────────────────────────────────────────
  async uploadProductImage(buffer: Buffer, originalName: string): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const safeName = originalName.replace(/\.[^.]+$/, '').replace(/[^a-z0-9_-]/gi, '-').toLowerCase().slice(0, 60)
      const stream = cloudinary.uploader.upload_stream(
        {
          folder:        'promesa-latina/products',
          public_id:     `${Date.now()}-${safeName}`,
          transformation: [
            { width: 900, height: 900, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) reject(error ?? new Error('Upload failed'))
          else resolve({ url: result.secure_url, publicId: result.public_id })
        },
      )
      Readable.from(buffer).pipe(stream)
    })
  }

  // ── Subir PDF de cotización ────────────────────────────────────────────
  // Cloudinary almacena PDFs como "raw" resources para acceso público permanente.
  async uploadPdf(buffer: Buffer, name: string): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const safeName = name.replace(/[^a-z0-9_-]/gi, '-').toLowerCase().slice(0, 80)
      const stream = cloudinary.uploader.upload_stream(
        {
          folder:        'promesa-latina/quotes',
          public_id:     `${Date.now()}-${safeName}`,
          resource_type: 'raw',   // raw = cualquier archivo binario (PDF, ZIP, etc.)
          format:        'pdf',
          access_mode:   'public',
        },
        (error, result) => {
          if (error || !result) reject(error ?? new Error('PDF upload failed'))
          else resolve({ url: result.secure_url, publicId: result.public_id })
        },
      )
      Readable.from(buffer).pipe(stream)
    })
  }

  // ── Eliminar recurso ──────────────────────────────────────────────────
  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId)
  }

  async deletePdf(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' })
  }

  // ── URL de thumbnail dinámico ─────────────────────────────────────────
  buildThumbnailUrl(publicId: string, size = 300): string {
    return cloudinary.url(publicId, {
      width: size, height: size, crop: 'fill',
      quality: 'auto', fetch_format: 'auto', secure: true,
    })
  }
}
