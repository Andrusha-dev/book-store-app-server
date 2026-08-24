import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AuthorService } from './author.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { AuthorResponseDto } from './dto/author-response.dto';
import { Auth } from '../../common/decorators/auth.decorator';
import { ApiErrors } from '../../common/decorators/api-errors.decorator';
import { AuthorsResponseDto } from './dto/authors-response.dto';
import { AuthorsQueryDto } from './dto/authors-query.dto';


@Controller('authors')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Post()
  @Auth("ADMIN")
  @ApiErrors()
  async create(@Body() dto: CreateAuthorDto): Promise<AuthorResponseDto> {
    return await this.authorService.create(dto);
  }

  @Get()
  @ApiErrors()
  async findMany(@Query() queryDto: AuthorsQueryDto ): Promise<AuthorsResponseDto> {
    return await this.authorService.findMany(queryDto);
  }

  @Get(':id')
  @ApiErrors()
  async findOne(@Param('id') id: string): Promise<AuthorResponseDto> {
    return await this.authorService.findOne(id)
  }

  @Patch(':id')
  @Auth("ADMIN")
  @ApiErrors()
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAuthorDto
  ): Promise<AuthorResponseDto> {
    return await this.authorService.update(id, dto);
  }

  @Delete(':id')
  @Auth("ADMIN")
  @ApiErrors()
  async remove(@Param('id') id: string): Promise<AuthorResponseDto> {
    return await this.authorService.remove(id);
  }
}
