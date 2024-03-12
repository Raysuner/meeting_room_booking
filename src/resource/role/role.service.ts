import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository, In } from 'typeorm';
import { ApiException } from 'src/filter/http-exception/api.exception';
import { ApiErrorMessage } from 'src/common/constant/api-error-msg.enum';
import { ApiErrorCode } from 'src/common/constant/api-error-code.enum';
import { Permission } from '../permission/entities/permission.entity';

@Injectable()
export class RoleService {
  @InjectRepository(Role)
  private roleRepository: Repository<Role>;

  @InjectRepository(Permission)
  private permissionRepository: Repository<Permission>;

  async create(createRoleDto: CreateRoleDto) {
    const matchedRole = await this.roleRepository.findOneBy({
      name: createRoleDto.name,
    });

    if (matchedRole) {
      throw new ApiException(
        ApiErrorMessage.ROLE_EXISTED,
        ApiErrorCode.ROLE_EXISTED,
      );
    }

    const matchedPermissionList = await this.permissionRepository.find({
      where: {
        name: In(createRoleDto.permissionNameList),
      },
    });

    const role = new Role();
    role.name = createRoleDto.name;
    role.permissions = matchedPermissionList;

    await this.roleRepository.save(role);

    return '创建角色成功';
  }
}
