import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const statusCode = exception.getStatus();

    // if (exception in)

    response.json(statusCode).json({
      code: statusCode,
      timestamp: new Date().toISOString(),
      message: (exception.getResponse() as any).message || exception.message,
    });
  }
}
