import { IsNotEmpty, IsNumber, IsUUID } from '@nestjs/class-validator';

export class ConfirmMeasureDto {
  @IsUUID()
  @IsNotEmpty()
  measure_uuid: string;

  @IsNumber()
  @IsNotEmpty()
  confirmed_value: number;
}
