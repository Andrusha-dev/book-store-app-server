

export class AuthorResponseDto {
  readonly id: string;
  readonly name: string;
  readonly imgUrl: string;
  readonly description?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}