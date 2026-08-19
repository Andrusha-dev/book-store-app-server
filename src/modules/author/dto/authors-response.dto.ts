import type { AuthorResponseDto } from './author-response.dto';
import type { PageMetaDto } from '../../../common/dto/page-meta.dto';


export class AuthorsResponseDto {
  readonly data: AuthorResponseDto[];
  readonly meta: PageMetaDto;
}