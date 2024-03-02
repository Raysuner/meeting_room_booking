import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'permission', comment: '权限' })
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 20,
    comment: '权限名称',
  })
  name: string;

  @Column({
    length: 100,
    comment: '权限描述',
  })
  description: string;
}
