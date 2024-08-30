import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateMeasureDto } from './dtos/create-measure.dto';

import { parse, Result } from 'file-type-mime';
import { writeFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Repository } from 'typeorm';
import { MeasureEntity } from './entities/measure.entity';
import { InjectRepository } from '@nestjs/typeorm';

import {
  GoogleAIFileManager,
  UploadFileResponse,
} from '@google/generative-ai/server';
import {
  GenerateContentResult,
  GenerativeModel,
  GoogleGenerativeAI,
} from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { ConfirmMeasureDto } from './dtos/confirm-measure.dto';
import { ResponseDto } from './dtos/response.dto';
import { Base64SavedFileInterface } from './interfaces/base64-saved-file.interface';

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
  ): Promise<ResponseDto> {
    const isMeasureDateTime: boolean = await this.verifyMeasureDatetimeType(
      createMeasureDto.measure_datetime,
      createMeasureDto.measure_type,
    );

    if (isMeasureDateTime === true) {
      const response: ResponseDto = {
        isValid: false,
        responseObject: {
          error_code: 'DOUBLE_REPORT',
          error_description: 'Leitura do mês já realizada',
        },
        status: 409,
      };

      return response;
    }

    const file: Base64SavedFileInterface = await this.saveBase64ToAFile(
      createMeasureDto.image,
    );
    const measureValue: number = await this.uploadFileToLLM(file);
    const url: string = await this.generateTemporaryLinkToImage(file.filename);

    const createMeasure: MeasureEntity = await this.measureRepository.save({
      image: file.filename,
      customer_code: createMeasureDto.customer_code,
      measure_datetime: createMeasureDto.measure_datetime,
      measure_type: createMeasureDto.measure_type.toLocaleLowerCase(),
      measure_value: measureValue,
      image_url: url,
    });

    const response: ResponseDto = {
      responseObject: {
        image_url: url,
        measure_value: measureValue,
        measure_uuid: createMeasure.measure_uuid,
      },
    };

    return response;
  }

  async confirmMeasure(
    confirmMeasure: ConfirmMeasureDto,
  ): Promise<ResponseDto> {
    const measure: MeasureEntity = await this.verifyUuidMeasure(
      confirmMeasure.measure_uuid,
    );

    if (measure === undefined) {
      const response: ResponseDto = {
        isValid: false,
        responseObject: {
          error_code: 'MEASURE_NOT_FOUND',
          error_description: 'Leitura não encontrada',
        },
        status: 404,
      };

      return response;
    }

    const isConfirmedMeasure: boolean =
      await this.verifyConfirmedMeasure(measure);

    if (isConfirmedMeasure === true) {
      const response: ResponseDto = {
        isValid: false,
        responseObject: {
          error_code: 'CONFIRMATION_DUPLICATE',
          error_description: 'Leitura do mês já realizada',
        },
        status: 409,
      };

      return response;
    }

    await this.measureRepository.save({
      ...measure,
      has_confirmed: true,
      confirmed_value: confirmMeasure.confirmed_value,
    });

    const response: ResponseDto = {
      responseObject: {
        success: 'true',
      },
    };

    return response;
  }

  async listMeasuresByCustomerCode(
    customerCode: string,
    measureType: string,
  ): Promise<object> {
    if (measureType !== undefined) {
      measureType = measureType.toLocaleLowerCase();
    }

    switch (measureType) {
      case undefined:
        const measuresByCustomerCode =
          await this.findMeasuresByCustomerCode(customerCode);

        if (measuresByCustomerCode.length > 0) {
          const measureObject = measuresByCustomerCode.map((measure) => {
            return {
              measure_uuid: measure.measure_uuid,
              measure_datetime: measure.measure_datetime,
              measure_type: measure.measure_type,
              has_confirmed: measure.has_confirmed,
              image_url: measure.image_url,
            };
          });

          throw new HttpException(
            {
              customer_code: customerCode,
              measures: measureObject,
            },
            HttpStatus.OK,
          );
        } else {
          throw new HttpException(
            {
              error_code: 'MEASURES_NOT_FOUND',
              error_description: 'Nenhuma leitura encontrada',
            },
            HttpStatus.NOT_FOUND,
          );
        }
      case 'gas':
        const measuresByCustomerCodeAndCustomerTypeGas =
          await this.findMeasureByCustomerCodeAndMeasureType(
            customerCode,
            measureType,
          );

        if (measuresByCustomerCodeAndCustomerTypeGas.length > 0) {
          // existe
          const measureObject = measuresByCustomerCodeAndCustomerTypeGas.map(
            (measure) => {
              return {
                measure_uuid: measure.measure_uuid,
                measure_datetime: measure.measure_datetime,
                measure_type: measure.measure_type,
                has_confirmed: measure.has_confirmed,
                image_url: measure.image_url,
              };
            },
          );

          throw new HttpException(
            {
              customer_code: customerCode,
              measures: measureObject,
            },
            HttpStatus.OK,
          );
        } else {
          throw new HttpException(
            {
              error_code: 'MEASURES_NOT_FOUND',
              error_description: 'Nenhuma leitura encontrada',
            },
            HttpStatus.NOT_FOUND,
          );
        }
      case 'water':
        const measuresByCustomerCodeAndCustomerTypeWater =
          await this.findMeasureByCustomerCodeAndMeasureType(
            customerCode,
            measureType,
          );

        if (measuresByCustomerCodeAndCustomerTypeWater.length > 0) {
          // existe
          const measureObject = measuresByCustomerCodeAndCustomerTypeWater.map(
            (measure) => {
              return {
                measure_uuid: measure.measure_uuid,
                measure_datetime: measure.measure_datetime,
                measure_type: measure.measure_type,
                has_confirmed: measure.has_confirmed,
                image_url: measure.image_url,
              };
            },
          );

          throw new HttpException(
            {
              customer_code: customerCode,
              measures: measureObject,
            },
            HttpStatus.OK,
          );
        } else {
          throw new HttpException(
            {
              error_code: 'MEASURES_NOT_FOUND',
              error_description: 'Nenhuma leitura encontrada',
            },
            HttpStatus.NOT_FOUND,
          );
        }
    }
    throw new HttpException(
      {
        error_code: 'INVALID_TYPE',
        error_description: 'Tipo de medição não permitida',
      },
      HttpStatus.BAD_REQUEST,
    );
  }

  // Other functions
  async saveBase64ToAFile(image: string) {
    const buffer: Buffer = Buffer.from(image, 'base64');
    const fileType: Result = parse(buffer);
    const fileExtension: string = fileType.ext;
    const filename: string = `${uuidv4()}.${fileExtension}`;
    const filePath: string = `${this.filePath}/${filename}`;

    const file: Base64SavedFileInterface = {
      filename: filename,
      fileMimeType: fileType.mime,
      filePath: filePath,
    };

    writeFileSync(filePath, buffer);

    return file;
  }

  async uploadFileToLLM(file: Base64SavedFileInterface): Promise<number> {
    const fileManager: GoogleAIFileManager = new GoogleAIFileManager(
      this.configService.get<string>('GEMINI_API_KEY'),
    );

    const uploadResult: UploadFileResponse = await fileManager.uploadFile(
      `${this.filePath}/${file.filename}`,
      {
        mimeType: `${file.fileMimeType}`,
      },
    );

    const genAI: GoogleGenerativeAI = new GoogleGenerativeAI(
      this.configService.get<string>('GEMINI_API_KEY'),
    );
    const model: GenerativeModel = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });
    const result: GenerateContentResult = await model.generateContent([
      'The image is supposed to be an water or gas meter. I want the awnswer as an integer with the exactly number it registered',
      {
        fileData: {
          fileUri: uploadResult.file.uri,
          mimeType: uploadResult.file.mimeType,
        },
      },
    ]);

    const measure: number = parseInt(result.response.text());

    return measure;
  }

  async verifyMeasureDatetimeType(
    measureDatetime: Date,
    measureType: string,
  ): Promise<boolean> {
    const isMeasureDateTime: MeasureEntity[] =
      await this.measureRepository.findBy({
        measure_datetime: measureDatetime,
        measure_type: measureType,
      });

    if (isMeasureDateTime.length > 0) {
      return true;
    }

    return false;
  }

  async generateTemporaryLinkToImage(filename: string): Promise<string> {
    const url: string = `${this.configService.get('BASE_URL')}:${this.configService.get('APP_PORT')}/public/uploads/${filename}`;

    return url;
  }

  async verifyUuidMeasure(measureUuid: string): Promise<MeasureEntity> {
    const isMeasureUuid: MeasureEntity = await this.measureRepository.findOne({
      where: {
        measure_uuid: measureUuid,
      },
    });

    if (isMeasureUuid) {
      return isMeasureUuid;
    }

    return undefined;
  }

  async verifyConfirmedMeasure(measure: MeasureEntity): Promise<boolean> {
    const isMeasureConfirmed: MeasureEntity =
      await this.measureRepository.findOne({
        where: {
          measure_uuid: measure.measure_uuid,
        },
        select: ['confirmed_value'],
      });

    if (isMeasureConfirmed) {
      return true;
    }

    return false;
  }

  async findMeasuresByCustomerCode(
    customerCode: string,
  ): Promise<MeasureEntity[]> {
    return this.measureRepository.find({
      where: { customer_code: customerCode },
    });
  }

  async findMeasureByCustomerCodeAndMeasureType(
    customerCode: string,
    measureType: string,
  ): Promise<MeasureEntity[]> {
    return this.measureRepository.find({
      where: { customer_code: customerCode, measure_type: measureType },
    });
  }
}
