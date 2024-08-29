import { Controller, Post, Body, Get } from '@nestjs/common';
import { MeasureService } from './measure.service';
import { CreateMeasureDto } from './dtos/create-measure.dto';
import { ListMeasureDto } from './dtos/list-measure.dto';

@Controller()
export class MeasureController {
  constructor(private readonly measureService: MeasureService) {}

  @Post('upload')
  createMeasure(@Body() createMeasureDto: CreateMeasureDto) {
    return this.measureService.createMeasure(createMeasureDto);
  }

  @Get()
  async listAllMeasures(): Promise<ListMeasureDto[]> {
    return (await this.measureService.findAllMeasures()).map(
      (measure) => measure,
    );
  }
}
