import type { PublisherEntity } from './entities/publisher.entity';
import type { PublisherResponseDto } from './dto/publiser-response.dto';

export class PublisherMapper {
  static toResponseDto(publisher: PublisherEntity): PublisherResponseDto {
    const responseDto: PublisherResponseDto = {
      id: publisher.id,
      name: publisher.name,
      logoUrl: publisher.logoUrl,
      createdAt: publisher.createdAt,
      updatedAt: publisher.updatedAt
    }

    return responseDto;
  }
}