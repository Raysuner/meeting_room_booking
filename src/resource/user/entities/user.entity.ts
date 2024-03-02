import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from 'src/resource/role/entities/role.entity';

@Entity({ name: 'user', comment: '用户' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, comment: '用户名' })
  username: string;

  @Column({ length: 50, comment: '密码' })
  password: string;

  @Column({ length: 50, comment: '邮箱' })
  email: string;

  @Column({ length: 100, comment: '头像', nullable: true })
  avatar: string;

  @Column({ length: 20, comment: '电话号码', nullable: true })
  phoneNumber: string;

  @Column({ comment: '是否冻结', default: false })
  isFrozen: boolean;

  @Column({ comment: '是否是管理员', default: false })
  isAdmin: boolean;

  @CreateDateColumn({ comment: '注册日期' })
  createTime: Date;

  @UpdateDateColumn({ comment: '更新日期' })
  updateTime: Date;

  @ManyToMany(() => Role)
  @JoinTable({ name: 'user_role' })
  roles: Role[];
}
