import { Controller, Post, Body } from '@nestjs/common';
import { MeasureService } from './measure.service';
import { CreateMeasureDto } from './dtos/create-measure.dto';

@Controller()
export class MeasureController {
  constructor(private readonly measureService: MeasureService) {}

  @Post('upload')
  createMeasure(@Body() createMeasureDto: CreateMeasureDto) {
    return this.measureService.createMeasure(createMeasureDto);
  }
}
