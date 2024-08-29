import { IsBase64, IsDate, IsString } from '@nestjs/class-validator';

export class CreateMeasureDto {
  @IsString()
  @IsBase64()
  image: string;

  @IsString()
  customer_code: string;

  @IsDate()
  measure_datetime: Date;

  @IsString()
  measure_type: string;
}
