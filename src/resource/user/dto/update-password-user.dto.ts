import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdatePasswordUserDto {
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;

  @IsEmail({}, { message: '邮箱格式错误' })
  email: string;

  @IsNotEmpty({ message: '验证码不能为空' })
  captcha;
}
