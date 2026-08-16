import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseInterceptors,
  ClassSerializerInterceptor, Query,
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
import { UsersResponseDto } from './dto/users-response.dto';
import { UsersQueryDto } from './dto/users-query.dto';


@Controller('users')
@UseInterceptors(ClassSerializerInterceptor) //обовязково вказуємо якщо
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Post()
  @ApiOkResponse({ type: UserResponseDto })
  @ApiErrorResponse()
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const responseDto: UserResponseDto = await this.usersService.create(dto);
    return responseDto;
  }

  @Get()
  @Auth('ADMIN')
  @ApiOkResponse({ type: UsersResponseDto })
  @ApiErrorResponse()
  async findMany(
    @Query() queryDto: UsersQueryDto
  ): Promise<UsersResponseDto> {
    const responseDto: UsersResponseDto =
      await this.usersService.findMany(queryDto);
    return responseDto;
  }

  @Get('me')
  @Auth()
  @ApiOkResponse({ type: UserResponseDto })
  @ApiErrorResponse()
  async findMe(@CurrentUser() user: ITokenPayload): Promise<UserResponseDto> {
    const responseDto: UserResponseDto = await this.usersService.findOne(
      user.id,
    );
    return responseDto;
  }

  @Get(':id')
  @Auth('ADMIN')
  @ApiOkResponse({ type: UserResponseDto })
  @ApiErrorResponse()
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const responseDto: UserResponseDto = await this.usersService.findOne(id);
    return responseDto;
  }

  @Patch('me')
  @Auth()
  async update(
    @CurrentUser() user: ITokenPayload,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const responseDto: UserResponseDto = await this.usersService.update(
      user.id,
      dto,
    );
    return responseDto;
  }
}
