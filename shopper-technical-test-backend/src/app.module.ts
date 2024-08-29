import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfigService } from './database/database-config.service';
import { MeasureModule } from './measures/measure.module';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigService,
      inject: [DatabaseConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: `${__dirname}/..`,
      serveRoot: '/',
    }),
    MeasureModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
