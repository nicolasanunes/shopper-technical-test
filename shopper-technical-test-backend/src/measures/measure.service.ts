import { Inject, Injectable } from '@nestjs/common';
import { CreateMeasureDto } from './dtos/create-measure.dto';

import { parse } from 'file-type-mime';
import { writeFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Repository } from 'typeorm';
import { MeasureEntity } from './entities/measure.entity';
import { InjectRepository } from '@nestjs/typeorm';

import { GoogleAIFileManager } from '@google/generative-ai/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { ListMeasureDto } from './dtos/list-measure.dto';

@Injectable()
export class MeasureService {
  constructor(
    @InjectRepository(MeasureEntity)
    private readonly measureRepository: Repository<MeasureEntity>,
    @Inject('filePath')
    private readonly filePath: string,
    private readonly configService: ConfigService,
  ) {}

  async createMeasure(
    createMeasureDto: CreateMeasureDto,
  ): Promise<CreateMeasureDto | string> {
    const isMeasureDateTime = await this.verifyMeasureDatetimeType(
      createMeasureDto.measure_datetime,
      createMeasureDto.measure_type,
    );

    if (isMeasureDateTime === false) {
      const file = await this.saveBase64ToAFile(createMeasureDto.image);
      const measureValue = await this.uploadFileToLLM(file);

      return this.measureRepository.save({
        image: file.filename,
        customer_code: createMeasureDto.customer_code,
        measure_datetime: createMeasureDto.measure_datetime,
        measure_type: createMeasureDto.measure_type,
        measure_value: measureValue,
      });
    } else {
      return 'Retornar erro caso já exista o registro.';
    }
  }

  // Other functions
  async saveBase64ToAFile(image: string) {
    const buffer = Buffer.from(image, 'base64');
    const fileType = parse(buffer);
    const fileMimeType = fileType.mime;
    const fileExtension = fileType.ext;
    const filename = `${uuidv4()}.${fileExtension}`;
    const filePath = `${this.filePath}/${filename}`;

    writeFileSync(filePath, buffer);

    return { filename, fileMimeType };
  }

  async uploadFileToLLM(file) {
    const fileManager = new GoogleAIFileManager(
      this.configService.get<string>('GEMINI_API_KEY'),
    );

    const uploadResult = await fileManager.uploadFile(
      `${this.filePath}/${file.filename}`,
      {
        mimeType: `${file.fileMimeType}`,
      },
    );
    // View the response.
    console.log(`Upload de imagem para o LLM realizado.`);

    const genAI = new GoogleGenerativeAI(
      this.configService.get<string>('GEMINI_API_KEY'),
    );
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent([
      'The image is supposed to be an water or gas meter. I want the awnswer as an integer with the exactly number it registered',
      {
        fileData: {
          fileUri: uploadResult.file.uri,
          mimeType: uploadResult.file.mimeType,
        },
      },
    ]);

    const measure = parseInt(result.response.text());

    return measure;
  }

  async findAllMeasures(): Promise<ListMeasureDto[]> {
    return this.measureRepository.find();
  }

  async verifyMeasureDatetimeType(
    measureDatetime: Date,
    measureType: string,
  ): Promise<boolean> {
    const isMeasureDateTime = await this.measureRepository.findBy({
      measure_datetime: measureDatetime,
      measure_type: measureType,
    });

    if (isMeasureDateTime.length > 0) {
      return true;
    } else {
      return false;
    }
  }
}
