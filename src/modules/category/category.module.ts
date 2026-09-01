import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { ProductModule } from '../product/product.module';
import { AdminCategoryController } from './admin-category.controller';

@Module({
  imports:[ProductModule],
  controllers: [CategoryController, AdminCategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
