import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiException } from './api.exception';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const statusCode = exception.getStatus();

    if (exception instanceof ApiException) {
      response.status(statusCode).json({
        code: exception.getErrorCode(),
        message: exception.getErrorMessage(),
      });
    }

    const { message } = exception.getResponse() as any;
    response.status(statusCode).json({
      code: statusCode,
      message: Array.isArray(message)
        ? message.join(',')
        : message || exception.message,
    });
  }
}
