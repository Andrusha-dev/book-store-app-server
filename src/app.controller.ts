import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiErrorResponse } from './common/decorators/api-error-response.decorator';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiErrorResponse()
  getHello(): string {
    return this.appService.getHello();
  }
}
