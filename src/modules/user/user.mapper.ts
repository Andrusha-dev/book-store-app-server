import type { IdentityEntity, UserEntity } from './entities/user.entity';
import type { UserResponseDto } from './dto/user-response.dto';
import type { IdentityResponseDto } from './dto/identity-response.dto';

export class UserMapper {
  static toResponseDto(user: UserEntity): UserResponseDto {
    const responseDto: UserResponseDto = {
      id: user.id,
      email: user.email,
      username: user.username ?? undefined,
      firstname: user.firstname ?? undefined,
      lastname: user.lastname ?? undefined,
      phone: user.phone ?? undefined,
      birthYear: user.birthYear ?? undefined,
      isMarried: user.isMarried,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      identities: user.identities.map((identityEntity) =>
        IdentityMapper.toResponseDto(identityEntity))
    };

    return responseDto;
  }
}

class IdentityMapper {
  static toResponseDto(identity: IdentityEntity): IdentityResponseDto {
    const responseDto: IdentityResponseDto = {
      id: identity.id,
      provider: identity.provider,
      providerId: identity.providerId,
      createdAt: identity.createdAt,
      updatedAt: identity.updatedAt,
      userId: identity.userId,
    };

    return responseDto;
  }
}