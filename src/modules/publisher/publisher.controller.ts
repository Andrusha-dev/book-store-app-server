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
  @Auth("ADMIN")
  @ApiErrors()
  async findOne(@Param('id') id: string):Promise<PublisherResponseDto> {
    return await this.publisherService.findOne(id);
  }

  @Patch(':id')
  @Auth("ADMIN")
  @ApiErrors()
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePublisherDto
  ): Promise<PublisherResponseDto> {
    return await this.publisherService.update(id, dto);
  }

  @Delete(':id')
  @Auth("ADMIN")
  @ApiErrors()
  async remove(@Param('id') id: string): Promise<PublisherResponseDto> {
    return await this.publisherService.remove(id);
  }
}
