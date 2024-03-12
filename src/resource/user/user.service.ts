import { Inject, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/create-user.dto';
import { RedisService } from 'src/resource/redis/redis.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { md5 } from 'src/utils';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiException } from 'src/filter/http-exception/api.exception';
import { ApiErrorMessage } from 'src/common/constant/api-error-msg.enum';
import { ApiErrorCode } from 'src/common/constant/api-error-code.enum';
import { Role } from '../role/entities/role.entity';

@Injectable()
export class UserService {
  @InjectRepository(Role)
  private roleRepository: Repository<Role>;

  @InjectRepository(User)
  private userRepository: Repository<User>;

  @Inject(RedisService)
  private redisService: RedisService;

  async register(user: RegisterUserDto, isAdmin = false) {
    const captcha = await this.redisService.get(user.email);
    if (!captcha) {
      throw new ApiException(
        ApiErrorMessage.INVALID_CAPTCHA,
        ApiErrorCode.INVALID_CAPTCHA,
      );
    }
    if (captcha !== user.captcha) {
      throw new ApiException(
        ApiErrorMessage.CAPTCHA_ERROR,
        ApiErrorCode.CAPTCHA_ERROR,
      );
    }

    const matchedUser = await this.userRepository.findOneBy({
      username: user.username,
    });
    if (matchedUser) {
      throw new ApiException(
        ApiErrorMessage.USER_EXISTED,
        ApiErrorCode.USER_EXISTED,
      );
    }

    const roleList = await this.roleRepository.findBy({
      name: isAdmin ? 'admin' : 'user',
    });

    const registerUser = new User();
    registerUser.username = user.username;
    registerUser.password = md5(user.password);
    registerUser.email = user.email;
    registerUser.isAdmin = isAdmin;
    registerUser.roles = roleList;

    await this.userRepository.save(registerUser);

    return '创建用户成功';
  }

  async login(user: LoginUserDto) {
    const matchedUser = await this.userRepository.findOne({
      where: {
        username: user.username,
      },
      relations: ['role', 'role_permission'],
    });

    if (!matchedUser) {
      throw new ApiException(
        ApiErrorMessage.USER_UNEXISTED,
        ApiErrorCode.USER_UNEXISTED,
      );
    }

    return matchedUser;
  }
}
