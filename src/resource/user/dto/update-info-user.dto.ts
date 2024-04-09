import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';

export class UpdateInfoUserDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @IsEmail({}, { message: '邮箱格式不合法' })
  email: string;

  @IsPhoneNumber('CN', { message: '手机格式不合法' })
  @IsOptional()
  phoneNumber: string;

  @IsOptional()
  avatar: string;
}
