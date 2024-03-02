import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/create-user.dto';
import { RedisService } from 'src/resource/redis/redis.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { md5 } from 'src/utils';

@Injectable()
export class UserService {
  private logger = new Logger();

  @InjectRepository(User)
  private userRepository: Repository<User>;

  @Inject(RedisService)
  private redisService: RedisService;

  async register(user: RegisterUserDto) {
    const captcha = await this.redisService.get(user.email);
    if (!captcha) {
      throw new HttpException(
        '未填写验证码或验证码已失效',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (captcha !== user.captcha) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }

    const matchedUser = await this.userRepository.findOneBy({
      username: user.username,
    });
    if (matchedUser) {
      throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
    }

    const registerUser = new User();
    registerUser.username = user.username;
    registerUser.password = md5(user.password);
    registerUser.email = user.email;
    // registerUser.roles =

    try {
      await this.userRepository.save(registerUser);
      return {
        success: true,
        msg: '注册成功',
      };
    } catch (error) {
      this.logger.log(error, UserService);
      return {
        success: false,
        msg: '注册失败',
      };
    }
  }
}
