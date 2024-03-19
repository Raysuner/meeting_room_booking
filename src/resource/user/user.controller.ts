import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { RedisService } from 'src/resource/redis/redis.service';
import { EmailService } from 'src/resource/email/email.service';
import { RegisterUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';

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

  @Post('login')
  async login(@Body() loginUser: LoginUserDto) {
    const matchedUser = await this.userService.login(loginUser);
    const accessToken = this.jwtService.sign(
      {
        username: matchedUser.username,
        password: matchedUser.password,
      },
      { expiresIn: '30m' },
    );
    const refreshToken = this.jwtService.sign(
      {
        username: matchedUser.username,
      },
      { expiresIn: '7d' },
    );
    return {
      accessToken,
      refreshToken,
    };
  }
}
