import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { Auth } from '../../common/decorators/auth.decorator';
import { AuthorService } from './author.service';
import { ApiErrors } from '../../common/decorators/api-errors.decorator';
import { CreateAuthorDto } from './dto/create-author.dto';
import { AuthorResponseDto } from './dto/author-response.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';


@Controller('admin/authors')
@Auth('ADMIN')
export class AdminAuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Post()
  @ApiErrors()
  async create(@Body() dto: CreateAuthorDto): Promise<AuthorResponseDto> {
    return await this.authorService.create(dto);
  }

  @Patch(':id')
  @ApiErrors()
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAuthorDto,
  ): Promise<AuthorResponseDto> {
    return await this.authorService.update(id, dto);
  }

  @Delete(':id')
  @Auth('ADMIN')
  @ApiErrors()
  async remove(@Param('id') id: string): Promise<AuthorResponseDto> {
    return await this.authorService.remove(id);
  }
}