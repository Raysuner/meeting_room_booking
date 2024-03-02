import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { Role } from 'src/resource/role/entities/role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from 'src/resource/email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role]), EmailModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
