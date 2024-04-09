import {
  Body,
  Controller,
  Get,
  Inject,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RedisService } from 'src/resource/redis/redis.service';
import { EmailService } from 'src/resource/email/email.service';
import { RegisterUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdatePasswordUserDto } from './dto/update-password-user.dto';
import { JwtService } from '@nestjs/jwt';
import { RequireLogin } from 'src/decorator/login/login.decorator';
import { RequireAdmin } from 'src/decorator/admin/admin.decorator';
import { UpdateInfoUserDto } from './dto/update-info-user.dto';
import { ApiErrorCode } from 'src/common/constant/api-error-code.enum';
import { ApiException } from 'src/filter/http-exception/api.exception';
import { ApiErrorMessage } from 'src/common/constant/api-error-msg.enum';
import { User } from 'src/decorator/user/user.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(EmailService)
  private emailService: EmailService;

  @Inject(JwtService)
  private jwtService: JwtService;

  @Get('registerCaptcha')
  async captcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);
    await this.redisService.set(address, code, 1000 * 60);
    // await this.emailService.sendMail({
    //   to: address,
    //   subject: '注册验证码',
    //   html: `<p>你的注册验证码是 ${code}</p>`,
    // });
    return '获取验证码成功';
  }

  @Post('register')
  async register(@Body() user: RegisterUserDto) {
    return await this.userService.register(user);
  }

  getToken(user) {
    const accessToken = this.jwtService.sign(
      {
        username: user.username,
        password: user.password,
        isAdmin: user.isAdmin,
      },
      { expiresIn: '10s' },
    );
    const refreshToken = this.jwtService.sign(
      {
        username: user.username,
      },
      { expiresIn: '10m' },
    );
    return {
      accessToken,
      refreshToken,
    };
  }

  @Post('login')
  async login(@Body() loginUser: LoginUserDto) {
    const matchedUser = await this.userService.login(loginUser);
    return this.getToken(matchedUser);
  }

  @Get('refreshToken')
  async refreshToken(@Query('token') token: string) {
    let data;
    try {
      data = this.jwtService.verify(token);
    } catch (error) {
      throw new ApiException(
        ApiErrorMessage.INVALID_TOKEN,
        ApiErrorCode.INVALID_TOKEN,
      );
    }
    const matchedUser = await this.userService.findUserByName(data.username);
    return this.getToken(matchedUser);
  }

  @Get('getUserInfo')
  @RequireLogin()
  async getUserInfo(@User() user) {
    return this.userService.getUserInfo(user.username);
  }

  @Post('updatePassword')
  async updatePassword(@Body() user: UpdatePasswordUserDto) {
    return await this.userService.updatePassword(user);
  }

  @Post('updateInfo')
  @RequireLogin()
  async updateUserInfo(@Body() user: UpdateInfoUserDto) {
    return this.userService.updateUserInfo(user);
  }

  @Get('list')
  @RequireLogin()
  @RequireAdmin()
  async getUserList(
    @Query('pageNo', ParseIntPipe) pageNo: number,
    @Query('pageSize', ParseIntPipe) pageSize: number,
  ) {
    return await this.userService.getUserList(pageNo, pageSize);
  }

  @Post('freeze')
  @RequireLogin()
  @RequireAdmin()
  async freezeUser(@Body() { username }: { username: string }) {
    return await this.userService.freezeUser(username);
  }
}
