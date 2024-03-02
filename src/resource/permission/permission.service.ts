import { Injectable, Logger } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { Permission } from './entities/permission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
      // throw new
    }
  }
}
