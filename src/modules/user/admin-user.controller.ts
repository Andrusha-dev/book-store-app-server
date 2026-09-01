import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { Auth } from '../../common/decorators/auth.decorator';
import { ApiErrors } from '../../common/decorators/api-errors.decorator';
import { UsersQueryDto } from './dto/users-query.dto';
import { UsersResponseDto } from './dto/users-response.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';

@Controller('admin/users')
@Auth('ADMIN')
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiErrors()
  async create(@Body() dto: AdminCreateUserDto): Promise<UserResponseDto> {
    return await this.userService.createForAdmin(dto);
  }

  @Get()
  @ApiErrors()
  async findMany(@Query() queryDto: UsersQueryDto): Promise<UsersResponseDto> {
    return await this.userService.findMany(queryDto);
  }

  @Get(':id')
  @ApiErrors()
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return await this.userService.findOne(id);
  }
}