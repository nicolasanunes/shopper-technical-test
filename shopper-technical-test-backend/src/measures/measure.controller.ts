import {
  Controller,
  Post,
  Body,
  Get,
  ValidationPipe,
  UsePipes,
  HttpException,
  HttpStatus,
  Patch,
  Param,
} from '@nestjs/common';
import { MeasureService } from './measure.service';
import { CreateMeasureDto } from './dtos/create-measure.dto';
import { ConfirmMeasureDto } from './dtos/confirm-measure.dto';

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
  createMeasure(@Body() createMeasure: CreateMeasureDto) {
    return this.measureService.createMeasure(createMeasure);
  }

  @Patch('confirm')
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
  confirmMeasure(@Body() confirmMeasure: ConfirmMeasureDto) {
    return this.measureService.confirmMeasure(confirmMeasure);
  }

  @Get('/:customer_code/list')
  listMeasuresByCustomerCode(
    @Param('customer_code') customerCode: string,
  ): Promise<object> {
    return this.measureService.listMeasuresByCustomerCode(customerCode);
  }
}
