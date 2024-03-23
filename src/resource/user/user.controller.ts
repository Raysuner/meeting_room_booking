import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { RedisService } from 'src/resource/redis/redis.service';
import { EmailService } from 'src/resource/email/email.service';
import { RegisterUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdatePasswordUserDto } from './dto/update-password-user.dto';
import { JwtService } from '@nestjs/jwt';
import { RequireLogin } from 'src/decorator/login/login.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(EmailService)
  private emailService: EmailService;

  @Inject(JwtService)
  private jwtService: JwtService;

  @Get('register-captcha')
  async captcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);
    await this.redisService.set(address, code, 1000 * 60);
    await this.emailService.sendMail({
      to: address,
      subject: '注册验证码',
      html: `<p>你的注册验证码是 ${code}</p>`,
    });
    return '获取验证码成功';
  }

  @Post('register')
  async register(@Body() user: RegisterUserDto) {
    return await this.userService.register(user);
  }

  getToken(user: LoginUserDto) {
    const accessToken = this.jwtService.sign(
      {
        username: user.username,
        password: user.password,
      },
      { expiresIn: '30m' },
    );
    const refreshToken = this.jwtService.sign(
      {
        username: user.username,
      },
      { expiresIn: '7d' },
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
  async refreshToken(@Query() token: string) {
    const data = this.jwtService.verify(token);
    const matchedUser = await this.userService.findUserByName(data.username);
    return this.getToken(matchedUser);
  }

  @Post('updatePassword')
  @RequireLogin()
  async updatePassword(@Body() user: UpdatePasswordUserDto) {
    return await this.userService.updatePassword(user);
  }

  // @Post('updateUserInfo')
  // @RequireLogin()
  // async updateUserInfo(@Body() user: UpdateUserDto) {
  //   const matchedUser = this.userService.findUserByName(user.username)

  // }
}
