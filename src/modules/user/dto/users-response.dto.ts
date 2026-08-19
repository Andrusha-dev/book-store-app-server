import {
  PageMetaDto,
} from '../../../common/dto/page-meta.dto';
import type { UserResponseDto } from './user-response.dto';


export class UsersResponseDto {
  readonly data: UserResponseDto[];
  readonly meta: PageMetaDto;

  constructor(data: UserResponseDto[], meta: PageMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}