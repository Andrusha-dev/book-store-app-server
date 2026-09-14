import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { Auth } from '../../common/decorators/auth.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { ITokenPayload } from '../../common/types/token-payload.interface';
import { ApiErrors } from '../../common/decorators/api-errors.decorator';


@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @Auth()
  @ApiErrors()
  async findMe(@CurrentUser() user: ITokenPayload): Promise<UserResponseDto> {
    return await this.userService.findOne(user.id);
  }

  @Patch('me')
  @Auth()
  @ApiErrors()
  async updateMe(
    @CurrentUser() user: ITokenPayload,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const responseDto: UserResponseDto = await this.userService.update(
      user.id,
      dto,
    );
    return responseDto;
  }
}
