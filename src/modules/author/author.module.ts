import { Module } from '@nestjs/common';
import { AuthorService } from './author.service';
import { AuthorController } from './author.controller';
import { ProductModule } from '../product/product.module';

@Module({
  imports:[ProductModule],
  controllers: [AuthorController],
  providers: [AuthorService],
})
export class AuthorModule {}
