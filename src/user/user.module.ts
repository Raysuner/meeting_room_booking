import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user';
import { Role } from './entities/role';
import { Permission } from './entities/permission';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission]), EmailModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
