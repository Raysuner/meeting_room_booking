import { Injectable, Logger } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { Permission } from './entities/permission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiException } from 'src/filter/http-exception/api.exception';
import { ApiErrorMessage } from 'src/common/constant/api-error-msg.enum';
import { ApiErrorCode } from 'src/common/constant/api-error-code.enum';

@Injectable()
export class PermissionService {
  private logger: Logger;

  @InjectRepository(Permission)
  private permissionRepository: Repository<Permission>;

  async create(createPermissionDto: CreatePermissionDto) {
    const name = createPermissionDto.name;
    const matchedPermission = await this.permissionRepository.findOneBy({
      name,
    });

    if (matchedPermission) {
      throw new ApiException(
        ApiErrorMessage.PERMISSION_EXISTED,
        ApiErrorCode.PERMISSION_EXISTED,
      );
    }

    await this.permissionRepository.save(createPermissionDto);

    return null;
  }
}
