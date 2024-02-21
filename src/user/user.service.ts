import { Inject, Injectable, Logger } from '@nestjs/common';
// import { RegisterUserDto } from './dto/user';
import { RedisService } from 'src/redis/redis.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user';
import { Repository } from 'typeorm';
// import { RedisClientType } from 'redis';

@Injectable()
export class UserService {
  private logger = new Logger();

  @InjectRepository(User)
  private userRepository: Repository<User>;

  @Inject(RedisService)
  private redisService: RedisService;

  // async register(user: RegisterUserDto) {
  //   const captcha = await this.redisService.get()
  // }
}
