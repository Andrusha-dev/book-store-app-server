import { Module } from '@nestjs/common';
import { AuthorService } from './author.service';
import { AuthorController } from './author.controller';
import { ProductModule } from '../product/product.module';
import { AdminAuthorController } from './admin-author.controller';

@Module({
  imports:[ProductModule],
  controllers: [AuthorController, AdminAuthorController],
  providers: [AuthorService],
})
export class AuthorModule {}
