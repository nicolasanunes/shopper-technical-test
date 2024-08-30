import { ValidationError } from '@nestjs/class-validator';
import { ValidationPipe } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomValidationPipe extends ValidationPipe {
  constructor() {
    super({
      exceptionFactory: (validationErrors: ValidationError[]) => {
        const errorMessages = validationErrors.map((error) => {
          return `${Object.values(error.constraints).join(', ')}`;
        });

        throw new HttpException(
          {
            error_code: 'INVALID_DATA',
            error_description: errorMessages.join(', '),
          },
          HttpStatus.BAD_REQUEST,
        );
      },
    });
  }
}
