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
}
