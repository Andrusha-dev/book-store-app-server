import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiErrorResponse } from '../../common/decorators/api-error-response.decorator';
import { UserResponseDto } from './dto/user-response.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { Auth } from '../../common/decorators/auth.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { ITokenPayload } from '../../common/types/token-payload.interface';
import { use } from 'passport';
import type { UserEntity } from './entities/user.entity';
import { UserMapper } from './user.mapper';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor) //обовязково вказуємо якщо
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Post()
  @ApiOkResponse({ type: UserResponseDto })
  @ApiErrorResponse()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const responseDto: UserResponseDto = await this.usersService.create(createUserDto);
    return responseDto;
  }

  @Get()
  @Auth("ADMIN")
  @ApiOkResponse({type: [UserResponseDto]})
  @ApiErrorResponse()
  async findAll(): Promise<UserResponseDto[]> {
    const responseDto: UserResponseDto[] =  await this.usersService.findAll();
    return responseDto;
  }

  @Get('me')
  @Auth()
  @ApiOkResponse({type: UserResponseDto})
  @ApiErrorResponse()
  async findMe(@CurrentUser() user: ITokenPayload): Promise<UserResponseDto> {
    const responseDto: UserResponseDto = await this.usersService.findOne(user.id);
    return responseDto;
  }

  @Get(':id')
  @Auth("ADMIN")
  @ApiOkResponse({type: UserResponseDto})
  @ApiErrorResponse()
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const responseDto: UserResponseDto = await this.usersService.findOne(id);
    return responseDto;
  }

  @Patch('me')
  @Auth()
  async update(
    @CurrentUser() user: ITokenPayload,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserResponseDto> {
    const responseDto: UserResponseDto = await this.usersService.update(user.id, updateUserDto);
    return responseDto
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
