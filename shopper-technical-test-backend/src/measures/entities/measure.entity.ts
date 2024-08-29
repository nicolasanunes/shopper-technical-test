import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'measure' })
export class MeasureEntity {
  @PrimaryGeneratedColumn('uuid')
  measure_uuid: string;

  @Column({ name: 'image' })
  image: string;

  @Column({ name: 'customer_code' })
  customer_code: string;

  @Column({ name: 'measure_datetime', type: 'timestamptz' })
  measure_datetime: Date;

  @Column({ name: 'measure_type' })
  measure_type: string;

  @Column({ name: 'measure_value' })
  measure_value: number;

  @Column({ name: 'confirmed_value', nullable: true })
  confirmed_value: number;

  @Column({ name: 'has_confirmed', default: false })
  has_confirmed: boolean;

  @Column({ name: 'image_url' })
  image_url: string;
}
