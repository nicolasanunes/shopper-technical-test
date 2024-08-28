import { Module } from '@nestjs/common';
import { MeasureService } from './measure.service';
import { MeasureController } from './measure.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeasureEntity } from './entities/measure.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MeasureEntity])],
  controllers: [MeasureController],
  providers: [
    MeasureService,
    {
      provide: 'filePath',
      useValue: `${__dirname}/../../public/uploads`,
    },
  ],
})
export class MeasureModule {}
