import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { json } from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('APP_PORT');

  app.use(json({ limit: '50mb' })); // Aumenta o tamanho limite permitido do JSON

  await app.listen(port);

  console.log(`App is running on port: ${port}`);
}
bootstrap();
