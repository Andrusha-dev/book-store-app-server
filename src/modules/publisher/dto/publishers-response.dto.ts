import type { PublisherResponseDto } from './publiser-response.dto';
import type { PageMetaDto } from '../../../common/dto/page-meta.dto';


export class PublishersResponseDto {
  readonly data: PublisherResponseDto[];
  readonly meta: PageMetaDto;
}