import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Instanciamos el ConfigService para leer variables de entorno
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  app.enableCors();

  const PORT = configService.get<number>('PORT') || 3002;
  await app.listen(PORT);
  console.log(`Servicio de Pedidos corriendo exitosamente en el puerto: ${PORT}`);
}
bootstrap();