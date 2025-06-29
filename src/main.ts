import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  //app.setGlobalPrefix('mm-request-api/v1');
  // app.setGlobalPrefix('mm-request-api/v1');
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.useStaticAssets(join(__dirname, '..', 'views/public'));
  
  
  app.setViewEngine('ejs');



  // Increase body size limit
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

 // app.use(multer().any());

  const config = new DocumentBuilder()
    .setTitle('Edu Manage Pro API Documentation')
    .setDescription('Edu Manage Pro')
    .setVersion('1.0')
    .addTag('api')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api-docs', app, document);

  await app.listen(process.env.PORT || 3000);
  console.log('HTTP server is running.');
}

bootstrap();

