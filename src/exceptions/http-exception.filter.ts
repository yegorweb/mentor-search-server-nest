import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import ApiError from 'src/exceptions/errors/api-error';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse<Response>()

    console.log(exception)

    if (exception.getStatus() === 500)
      return res.status(500).json({ message: 'Непредвиденная ошибка' })
   
    if (exception instanceof ApiError)
      return res.status(exception.error_code).json({ message: exception.message })
  }
}
