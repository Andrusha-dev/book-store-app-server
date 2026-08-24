import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PublisherService } from './publisher.service';
import { CreatePublisherDto } from './dto/create-publisher.dto';
import { UpdatePublisherDto } from './dto/update-publisher.dto';
import { Auth } from '../../common/decorators/auth.decorator';
import { ApiErrors } from '../../common/decorators/api-errors.decorator';
import { PublisherResponseDto } from './dto/publiser-response.dto';
import { PublishersResponseDto } from './dto/publishers-response.dto';
import { PublishersQueryDto } from './dto/publishers-query.dto';

@Controller('publishers')
export class PublisherController {
  constructor(private readonly publisherService: PublisherService) {}

  @Post()
  @Auth("ADMIN")
  @ApiErrors()
  async create(@Body() dto: CreatePublisherDto): Promise<PublisherResponseDto> {
    return await this.publisherService.create(dto);
  }

  @Get()
  @ApiErrors()
  async findMany(@Query() queryDto: PublishersQueryDto): Promise<PublishersResponseDto> {
    return await this.publisherService.findMany(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.publisherService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePublisherDto: UpdatePublisherDto) {
    return this.publisherService.update(+id, updatePublisherDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.publisherService.remove(+id);
  }
}
