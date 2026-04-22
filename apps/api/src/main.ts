// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api')

  // Validación automática de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:        true,   // elimina propiedades no declaradas en el DTO
      forbidNonWhitelisted: false,
      transform:        true,   // convierte strings a number/boolean automáticamente
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  // CORS — en producción reemplazar con el dominio real
  app.enableCors({
    origin:      process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
    methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })

  const port = process.env.PORT ?? 3001
  await app.listen(port)

  console.log(`\n🌎 Promesa Latina API corriendo en: http://localhost:${port}/api`)
  console.log(`📦 Entorno: ${process.env.NODE_ENV ?? 'development'}\n`)
}

bootstrap()
