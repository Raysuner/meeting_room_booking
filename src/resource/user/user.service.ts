import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/create-user.dto';
import { RedisService } from 'src/resource/redis/redis.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { md5 } from 'src/utils/utils';
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

  async register(registerUser: RegisterUserDto) {
    const captcha = await this.redisService.get(registerUser.email);
    if (!captcha) {
      throw new ApiException(
        ApiErrorMessage.INVALID_CAPTCHA,
        ApiErrorCode.INVALID_CAPTCHA,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (captcha !== registerUser.captcha) {
      throw new ApiException(
        ApiErrorMessage.CAPTCHA_ERROR,
        ApiErrorCode.CAPTCHA_ERROR,
        HttpStatus.BAD_REQUEST,
      );
    }

    const matchedUser = await this.userRepository.findOneBy({
      username: registerUser.username,
    });
    if (matchedUser) {
      throw new ApiException(
        ApiErrorMessage.USER_EXISTED,
        ApiErrorCode.USER_EXISTED,
        HttpStatus.FORBIDDEN,
      );
    }

    const roleList = await this.roleRepository.findBy({
      name: 'user',
    });

    const user = new User();
    user.username = registerUser.username;
    user.password = md5(registerUser.password);
    user.email = registerUser.email;
    user.roles = roleList;

    await this.userRepository.save(user);

    return '创建用户成功';
  }

  async login(loginUser: LoginUserDto) {
    const matchedUser = await this.userRepository.findOne({
      where: {
        username: loginUser.username,
      },
      relations: ['roles', 'roles.permissions'],
    });

    if (!matchedUser) {
      throw new ApiException(
        ApiErrorMessage.USER_UNEXISTED,
        ApiErrorCode.USER_UNEXISTED,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (md5(loginUser.password) !== matchedUser.password) {
      throw new ApiException(
        ApiErrorMessage.PASSWORD_ERROR,
        ApiErrorCode.PASSWORD_ERROR,
        HttpStatus.BAD_REQUEST,
      );
    }

    return matchedUser;
  }
}
