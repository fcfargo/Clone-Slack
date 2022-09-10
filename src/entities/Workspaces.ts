import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Channels } from './Channels';
import { DMs } from './DMs';
import { Mentions } from './Mentions';
import { WorkspaceMembers } from './WorkspaceMembers';
import { Users } from './Users';
import { isDate, IsDate, IsDateString, IsNotEmpty, isNumber, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Index('name', ['name'], { unique: true })
@Index('url', ['url'], { unique: true })
@Index('OwnerId', ['OwnerId'], {})
@Entity({ schema: 'sleact', name: 'workspaces' })
export class Workspaces {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: '1',
    description: '워크스페이스 id',
  })
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '슬리액트',
    description: '워크스페이스 이름',
  })
  @Column('varchar', { name: 'name', unique: true, length: 30 })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'sleact',
    description: 'url 주소',
  })
  @Column('varchar', { name: 'url', unique: true, length: 30 })
  url: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    example: '2022-08-15T12:23:48.493Z',
    description: '생성 일자',
  })
  @CreateDateColumn()
  createdAt: Date;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    example: '2022-08-15T12:23:48.493Z',
    description: '수정 일자',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    example: '2022-08-15T12:23:48.493Z',
    description: '삭제 일자',
  })
  @DeleteDateColumn()
  deletedAt: Date | null;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: '워크스페이스 소유자 uid',
  })
  @Column('int', { name: 'OwnerId', nullable: true })
  OwnerId: number | null;

  @OneToMany(() => Channels, (channels) => channels.Workspace)
  Channels: Channels[];

  @OneToMany(() => DMs, (dms) => dms.Workspace)
  DMs: DMs[];

  @OneToMany(() => Mentions, (mentions) => mentions.Workspace)
  Mentions: Mentions[];

  @OneToMany(() => WorkspaceMembers, (workspacemembers) => workspacemembers.Workspace, { cascade: ['insert'] })
  WorkspaceMembers: WorkspaceMembers[];

  @ManyToOne(() => Users, (users) => users.Workspaces, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'OwnerId', referencedColumnName: 'id' }])
  Owner: Users;

  @ManyToMany(() => Users, (users) => users.Workspaces)
  Members: Users[];
}
