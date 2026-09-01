import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AdminUserController } from './admin-user.controller';

@Module({
  controllers: [UserController, AdminUserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
