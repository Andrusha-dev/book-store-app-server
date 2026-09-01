import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Auth } from '../../common/decorators/auth.decorator';
import { PublisherService } from './publisher.service';
import { ApiErrors } from '../../common/decorators/api-errors.decorator';
import { CreatePublisherDto } from './dto/create-publisher.dto';
import { PublisherResponseDto } from './dto/publiser-response.dto';
import { UpdatePublisherDto } from './dto/update-publisher.dto';


@Controller('admin/publishers')
@Auth('ADMIN')
export class AdminPublisherController {
  constructor(private readonly publisherService: PublisherService) {}

  @Post()
  @ApiErrors()
  async create(@Body() dto: CreatePublisherDto): Promise<PublisherResponseDto> {
    return await this.publisherService.create(dto);
  }

  @Get(':id')
  @ApiErrors()
  async findOne(@Param('id') id: string): Promise<PublisherResponseDto> {
    return await this.publisherService.findOne(id);
  }

  @Patch(':id')
  @ApiErrors()
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePublisherDto,
  ): Promise<PublisherResponseDto> {
    return await this.publisherService.update(id, dto);
  }

  @Delete(':id')
  @ApiErrors()
  async remove(@Param('id') id: string): Promise<PublisherResponseDto> {
    return await this.publisherService.remove(id);
  }
}