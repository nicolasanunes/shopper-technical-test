import { Inject, Injectable } from '@nestjs/common';
import { CreateMeasureDto } from './dtos/create-measure.dto';

import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Repository } from 'typeorm';
import { MeasureEntity } from './entities/measure.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MeasureService {
  constructor(
    @InjectRepository(MeasureEntity)
    private readonly measureEntity: Repository<MeasureEntity>,
    @Inject('filePath')
    private readonly filePath: string,
  ) {}

  createMeasure(createMeasureDto: CreateMeasureDto) {
    this.saveBase64ToAFile(createMeasureDto.image);
    return 'This action adds a new measure';
  }

  // Other functions
  saveBase64ToAFile(image: string) {
    const buffer = Buffer.from(image, 'base64');

    const filename = `${uuidv4()}.jpg`;

    fs.writeFileSync(`${this.filePath}/${filename}`, buffer);
  }
}
