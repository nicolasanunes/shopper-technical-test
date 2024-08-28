import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'measure' })
export class MeasureEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'image' })
  image: string;

  @Column({ name: 'customer_code' })
  customerCode: string;

  @Column({ name: 'measure_datetime' })
  measureDatetime: Date;

  @Column({ name: 'measure_type' })
  measureType: string;
}
