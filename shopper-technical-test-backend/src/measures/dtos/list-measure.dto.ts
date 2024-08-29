import { MeasureEntity } from '../entities/measure.entity';

export class ListMeasureDto {
  measure_uuid: string;
  image: string;
  customer_code: string;
  measure_datetime: Date;
  measure_type: string;
  measure_value: number;

  constructor(measure: MeasureEntity) {
    this.measure_uuid = measure.measure_uuid;
    this.image = measure.image;
    this.customer_code = measure.customer_code;
    this.measure_datetime = measure.measure_datetime;
    this.measure_type = measure.measure_type;
    this.measure_value = measure.measure_value;
  }
}
