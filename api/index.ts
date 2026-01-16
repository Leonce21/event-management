import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

let nestApp: any;

async function bootstrap() {
  if (!nestApp) {
    nestApp = await NestFactory.create(AppModule, new ExpressAdapter(server));
    nestApp.enableCors();
    nestApp.setGlobalPrefix('api');
    nestApp.useGlobalInterceptors(new ResponseInterceptor());

    // ⚠️ Only enable Swagger in dev
    if (process.env.NODE_ENV !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('Event Management API')
        .setDescription('Open Event Management REST APIs')
        .setVersion('1.0')
        .build();
      const document = SwaggerModule.createDocument(nestApp, config);
      SwaggerModule.setup('api/docs', nestApp, document);
    }

    await nestApp.init();
  }

  return server;
}

export default async (req, res) => {
  const app = await bootstrap();
  app(req, res);
};
