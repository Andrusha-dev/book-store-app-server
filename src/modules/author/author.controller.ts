import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthorService } from './author.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { AuthorResponseDto } from './dto/author-response.dto';
import { ApiErrorResponse } from '../../common/decorators/api-error-response.decorator';
import { Auth } from '../../common/decorators/auth.decorator';

@Controller('authors')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Post()
  @Auth("ADMIN")
  @ApiOkResponse({ type: AuthorResponseDto })
  @ApiErrorResponse()
  async create(@Body() createAuthorDto: CreateAuthorDto): Promise<CreateAuthorDto> {
    const responseDto = await this.authorService.create(createAuthorDto);
    return responseDto;
  }

  @Get()
  findAll() {
    return this.authorService.findAll();
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
