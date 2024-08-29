import {
  IsBase64,
  IsDateString,
  IsNotEmpty,
  IsString,
} from '@nestjs/class-validator';

export class CreateMeasureDto {
  @IsString()
  @IsBase64()
  image: string;

  @IsString()
  customer_code: string;

  @IsDateString()
  measure_datetime: Date;

  @IsString()
  @IsNotEmpty()
  measure_type: string;
}
