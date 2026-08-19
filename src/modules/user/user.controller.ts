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
import { UserResponseDto } from './dto/user-response.dto';
import { Auth } from '../../common/decorators/auth.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { ITokenPayload } from '../../common/types/token-payload.interface';
import { UsersResponseDto } from './dto/users-response.dto';
import { UsersQueryDto } from './dto/users-query.dto';
import { ApiErrors } from '../../common/decorators/api-errors.decorator';


@Controller('users')
@UseInterceptors(ClassSerializerInterceptor) //обовязково вказуємо якщо
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Post()
  //@ApiOkResponse({ type: UserResponseDto })
  @ApiErrors()
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const responseDto: UserResponseDto = await this.usersService.create(dto);
    return responseDto;
  }

  @Get()
  @Auth('ADMIN')
  @ApiErrors()
  async findMany(
    @Query() queryDto: UsersQueryDto
  ): Promise<UsersResponseDto> {
    const responseDto: UsersResponseDto = await this.usersService.findMany(queryDto);
    return responseDto;
  }

  @Get('me')
  @Auth()
  @ApiErrors()
  async findMe(@CurrentUser() user: ITokenPayload): Promise<UserResponseDto> {
    const responseDto: UserResponseDto = await this.usersService.findOne(
      user.id,
    );
    return responseDto;
  }

  @Get(':id')
  @Auth('ADMIN')
  @ApiErrors()
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const responseDto: UserResponseDto = await this.usersService.findOne(id);
    return responseDto;
  }

  @Patch('me')
  @Auth()
  @ApiErrors()
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
