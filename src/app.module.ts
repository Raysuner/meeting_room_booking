import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './resource/user/user.module';
import { RedisModule } from './resource/redis/redis.module';
import { User } from './resource/user/entities/user.entity';
import { Role } from './resource/role/entities/role.entity';
import { Permission } from './resource/permission/entities/permission.entity';
import { EmailModule } from './resource/email/email.module';
import { RoleModule } from './resource/role/role.module';
import { PermissionModule } from './resource/permission/permission.module';
import { AuthModule } from './resource/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '123',
      database: 'meeting_room_booking_system',
      synchronize: true,
      logging: true,
      entities: [User, Role, Permission],
      poolSize: 10,
      connectorPackage: 'mysql2',
      extra: {
        authPlugin: 'sha256_password',
      },
    }),
    UserModule,
    RedisModule,
    EmailModule,
    RoleModule,
    PermissionModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
