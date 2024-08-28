import { IsBase64, IsDate, IsString } from '@nestjs/class-validator';

export class CreateMeasureDto {
  @IsString()
  @IsBase64()
  image: string;

  @IsString()
  customerCode: string;

  @IsDate()
  measureDatetime: Date;

  @IsString()
  measureType: string;
}
