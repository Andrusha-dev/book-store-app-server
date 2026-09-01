import { Controller, Get} from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiErrors } from '../../common/decorators/api-errors.decorator';
import { CategoryResponseDto } from './dto/category-response.dto';


@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiErrors()
  async findAll(): Promise<CategoryResponseDto[]> {
    return await this.categoryService.findAll();
  }
}
