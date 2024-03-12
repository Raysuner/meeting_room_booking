import { ArrayMinSize, IsNotEmpty } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty({ message: '角色名称不能为空' })
  name: string;

  @ArrayMinSize(1, { message: '权限数组不能为空' })
  permissionNameList: string[];
}
