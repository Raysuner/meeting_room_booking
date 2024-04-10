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

  @IsOptional()
  // @IsNotEmpty({ message: '手机号码不能为空' })
  @IsPhoneNumber('CN', { message: '手机格式不合法' })
  phoneNumber: string;

  @IsOptional()
  // @IsNotEmpty({ message: '头像不能为空' })
  avatar: string;
}
