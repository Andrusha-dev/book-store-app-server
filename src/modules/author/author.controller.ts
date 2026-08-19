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
    const responseDto = await this.authorService.create(dto);
    return responseDto;
  }

  @Get()
  @ApiErrors()
  async findMany(@Query() queryDto: AuthorsQueryDto ): Promise<AuthorsResponseDto> {
    console.log('RAW queryDto:', queryDto);
    const responseDto: AuthorsResponseDto = await this.authorService.findMany(queryDto);
    return responseDto;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthorDto: UpdateAuthorDto) {
    return this.authorService.update(+id, updateAuthorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authorService.remove(+id);
  }
}
