import { IsNotEmpty } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty({ message: '权限名称不能为空' })
  name: string;

  @IsNotEmpty({ message: '权限描述不可为空' })
  description: string;
}
