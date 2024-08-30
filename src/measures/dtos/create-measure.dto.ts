import {
  IsBase64,
  IsDateString,
  IsNotEmpty,
  IsString,
} from '@nestjs/class-validator';

export class CreateMeasureDto {
  @IsString()
  @IsBase64()
  @IsNotEmpty()
  image: string;

  @IsString()
  @IsNotEmpty()
  customer_code: string;

  @IsDateString()
  @IsNotEmpty()
  measure_datetime: Date;

  @IsString()
  @IsNotEmpty()
  measure_type: string;
}
