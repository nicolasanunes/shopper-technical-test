import {
  Controller,
  Post,
  Body,
  Get,
  ValidationPipe,
  UsePipes,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MeasureService } from './measure.service';
import { CreateMeasureDto } from './dtos/create-measure.dto';
import { ListMeasureDto } from './dtos/list-measure.dto';

@Controller()
export class MeasureController {
  constructor(private readonly measureService: MeasureService) {}

  @Post('upload')
  @UsePipes(
    new ValidationPipe({
      exceptionFactory: () => {
        throw new HttpException(
          {
            error_code: 'INVALID_DATA',
            error_description:
              'Os dados fornecidos no corpo da requisição são inválidos',
          },
          HttpStatus.BAD_REQUEST,
        );
      },
    }),
  )
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
