import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiErrorResponse } from '../../common/decorators/api-error-response.decorator';
import { UserResponseDto } from './dto/user-response.dto';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Post()
  @ApiOkResponse({type: UserResponseDto})
  @ApiErrorResponse()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const responseDto: UserResponseDto = await this.usersService.create(createUserDto);
    return responseDto;
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
