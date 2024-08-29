import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
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
import { ConfirmMeasureDto } from './dtos/confirm-measure.dto';

@Injectable()
export class MeasureService {
  constructor(
    @InjectRepository(MeasureEntity)
    private readonly measureRepository: Repository<MeasureEntity>,
    @Inject('filePath')
    private readonly filePath: string,
    private readonly configService: ConfigService,
  ) {}

  async createMeasure(createMeasureDto: CreateMeasureDto): Promise<object> {
    const isMeasureDateTime = await this.verifyMeasureDatetimeType(
      createMeasureDto.measure_datetime,
      createMeasureDto.measure_type,
    );

    if (isMeasureDateTime === false) {
      const file = await this.saveBase64ToAFile(createMeasureDto.image);
      const measureValue = await this.uploadFileToLLM(file);
      const url = await this.generateTemporaryLinkToImage(file.filename);

      const createMeasure = await this.measureRepository.save({
        image: file.filename,
        customer_code: createMeasureDto.customer_code,
        measure_datetime: createMeasureDto.measure_datetime,
        measure_type: createMeasureDto.measure_type,
        measure_value: measureValue,
      });

      throw new HttpException(
        {
          image_url: url,
          measure_value: measureValue,
          measure_uuid: createMeasure.measure_uuid,
        },
        HttpStatus.OK,
      );
    } else if (isMeasureDateTime === true) {
      throw new HttpException(
        {
          error_code: 'DOUBLE_REPORT',
          error_description: 'Leitura do mês já realizada',
        },
        HttpStatus.CONFLICT,
      );
    }

    throw new HttpException(
      {
        error_code: 'INVALID_DATA',
        error_description:
          'Os dados fornecidos no corpo da requisição são inválidos',
      },
      HttpStatus.BAD_REQUEST,
    );
  }

  async confirmMeasure(confirmMeasure: ConfirmMeasureDto) {
    const measure = await this.verifyUuidMeasure(confirmMeasure.measure_uuid);

    if (measure !== undefined) {
      const isConfirmedMeasure = await this.verifyConfirmedMeasure(measure);
      if (isConfirmedMeasure === true) {
        throw new HttpException(
          {
            error_code: 'CONFIRMATION_DUPLICATE',
            error_description: 'Leitura do mês já realizada',
          },
          HttpStatus.CONFLICT,
        );
      } else if (isConfirmedMeasure === false) {
        await this.measureRepository.save({
          ...measure,
          confirmed_value: confirmMeasure.confirmed_value,
        });

        throw new HttpException(
          {
            success: 'true',
          },
          HttpStatus.OK,
        );
      }
    } else {
      throw new HttpException(
        {
          error_code: 'MEASURE_NOT_FOUND',
          error_description: 'Leitura não encontrada',
        },
        HttpStatus.NOT_FOUND,
      );
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

    return { filename, fileMimeType, filePath };
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

  async generateTemporaryLinkToImage(filename: string): Promise<string> {
    const url = `${this.configService.get('BASE_URL')}:${this.configService.get('APP_PORT')}/public/uploads/${filename}`;

    return url;
  }

  async verifyUuidMeasure(measureUuid: string): Promise<MeasureEntity> {
    const isMeasureUuid = await this.measureRepository.findOne({
      where: {
        measure_uuid: measureUuid,
      },
    });

    if (isMeasureUuid) {
      return isMeasureUuid;
    } else {
      return undefined;
    }
  }

  async verifyConfirmedMeasure(measure: MeasureEntity): Promise<boolean> {
    const isMeasureConfirmed = await this.measureRepository.findOne({
      where: {
        measure_uuid: measure.measure_uuid,
      },
      select: ['confirmed_value'],
    });

    if (isMeasureConfirmed) {
      return true;
    } else {
      return false;
    }
  }
}
