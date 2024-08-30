import { ValidationPipe } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomValidationPipe extends ValidationPipe {
  constructor() {
    super({
      exceptionFactory: () => {
        throw new HttpException(
          {
            error_code: 'INVALID_DATA',
            error_description:
              'Os dados fornecidos no corpo da requisição são inválidos',
          },
          HttpStatus.BAD_REQUEST,
        );
      },
    });
  }
}
