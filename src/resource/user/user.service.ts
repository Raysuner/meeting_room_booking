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
import { UpdatePasswordUserDto } from './dto/update-password-user.dto';
import { UpdateInfoUserDto } from './dto/update-info-user.dto';

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
      );
    }
    if (captcha !== registerUser.captcha) {
      throw new ApiException(
        ApiErrorMessage.CAPTCHA_ERROR,
        ApiErrorCode.CAPTCHA_ERROR,
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
        ApiErrorMessage.USER_UN_EXISTED,
        ApiErrorCode.USER_UN_EXISTED,
      );
    }

    if (md5(loginUser.password) !== matchedUser.password) {
      throw new ApiException(
        ApiErrorMessage.PASSWORD_ERROR,
        ApiErrorCode.PASSWORD_ERROR,
      );
    }

    return matchedUser;
  }

  async findUserByName(username: string) {
    return await this.userRepository.findOneBy({ username: username });
  }

  async updatePassword(user: UpdatePasswordUserDto) {
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
      email: user.email,
    });
    matchedUser.password = md5(user.password);
    await this.userRepository.save(matchedUser);
    return '修改密码成功';
  }

  async updateUserInfo(user: UpdateInfoUserDto) {
    console.log(user);
  }

  async getUserList(pageNo: number, pageSize: number) {
    const list = await this.userRepository.find({
      where: {
        isAdmin: false,
        isFrozen: false,
      },
      relations: ['roles', 'roles.permissions'],
    });

    return list.slice((pageNo - 1) * pageSize, pageNo * pageSize) || [];
  }

  async freezeUser(username: string) {
    const matchedUser = await this.userRepository.findOneBy({ username });
    if (matchedUser.isFrozen) {
      throw new ApiException(
        ApiErrorMessage.USER_FREEZED,
        ApiErrorCode.USER_FREEZED,
      );
    }
    matchedUser.isFrozen = true;
    await this.userRepository.save(matchedUser);
    return '冻结用户成功';
  }

  async unfreezeUser(username: string) {
    const matchedUser = await this.userRepository.findOneBy({ username });
    if (matchedUser.isFrozen) {
      throw new ApiException(
        ApiErrorMessage.USER_UNFREEZE,
        ApiErrorCode.USER_UNFREEZE,
      );
    }
    matchedUser.isFrozen = false;
    await this.userRepository.save(matchedUser);
  }
}
