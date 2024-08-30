import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      // host: this.configService.get<string>('DB_HOST'),
      host: 'localhost',
      // port: this.configService.get<number>('DB_PORT'),
      port: 5432,
      // username: this.configService.get<string>('DB_USERNAME'),
      username: 'postgres',
      // password: this.configService.get<string>('DB_PASSWORD'),
      password: 'postgres',
      // database: this.configService.get<string>('DB_NAME'),
      database: 'db_shopper_technical_test',
      entities: [__dirname + '/../**/*.entity{.js,.ts}'],
      synchronize: true,
    };
  }
}
