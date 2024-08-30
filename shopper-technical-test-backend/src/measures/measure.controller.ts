import {
  Controller,
  Post,
  Body,
  Get,
  UsePipes,
  HttpException,
  Patch,
  Param,
  Query,
  HttpCode,
} from '@nestjs/common';
import { MeasureService } from './measure.service';
import { CreateMeasureDto } from './dtos/create-measure.dto';
import { ConfirmMeasureDto } from './dtos/confirm-measure.dto';
import { CustomValidationPipe } from 'src/pipes/validation.pipe';
import { ResponseDto } from './dtos/response.dto';

@Controller()
export class MeasureController {
  constructor(private readonly measureService: MeasureService) {}

  @Post('upload')
  @UsePipes(CustomValidationPipe)
  @HttpCode(200)
  async createMeasure(
    @Body() createMeasure: CreateMeasureDto,
  ): Promise<ResponseDto | object> {
    const response = await this.measureService.createMeasure(createMeasure);

    if (response.isValid === true) {
      return response.responseObject;
    }

    throw new HttpException(response.responseObject, response.status);
  }

  @Patch('confirm')
  @UsePipes(CustomValidationPipe)
  confirmMeasure(@Body() confirmMeasure: ConfirmMeasureDto) {
    return this.measureService.confirmMeasure(confirmMeasure);
  }

  @Get('/:customer_code/list')
  listMeasuresByCustomerCode(
    @Param('customer_code') customerCode: string,
    @Query('measure_type') measureType?: string,
  ): Promise<object> {
    return this.measureService.listMeasuresByCustomerCode(
      customerCode,
      measureType,
    );
  }
}
