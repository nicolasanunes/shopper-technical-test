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
import { ResponseDto } from './dtos/response.dto';
import { CustomValidationPipe } from 'src/pipes/custom-validation.pipe';

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

    if (response.isValid === false) {
      throw new HttpException(response.responseObject, response.status);
    }

    return response.responseObject;
  }

  @Patch('confirm')
  @UsePipes(CustomValidationPipe)
  async confirmMeasure(
    @Body() confirmMeasure: ConfirmMeasureDto,
  ): Promise<ResponseDto | object> {
    const response = await this.measureService.confirmMeasure(confirmMeasure);

    if (response.isValid === false) {
      throw new HttpException(response.responseObject, response.status);
    }

    return response.responseObject;
  }

  @Get('/:customer_code/list')
  async listMeasuresByCustomerCode(
    @Param('customer_code') customerCode: string,
    @Query('measure_type') measureType?: string,
  ): Promise<ResponseDto | object> {
    const response = await this.measureService.listMeasuresByCustomerCode(
      customerCode,
      measureType?.toLocaleLowerCase(),
    );

    if (response.isValid === false) {
      throw new HttpException(response.responseObject, response.status);
    }

    return response.responseObject;
  }
}
