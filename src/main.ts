import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpTransformInterceptor } from './interceptor/http-transform/http-transform.interceptor';
import { HttpExceptionFilter } from './filter/http-exception/http-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new HttpTransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();
  app.useStaticAssets('uploads', {
    prefix: '/uploads',
  });
  await app.listen(3000);
}
bootstrap();
