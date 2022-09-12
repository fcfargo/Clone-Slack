import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChannelChats } from './ChannelChats';
import { ChannelMembers } from './ChannelMembers';
import { Users } from './Users';
import { Workspaces } from './Workspaces';

@Index('WorkspaceId', ['WorkspaceId'], {})
@Entity({ schema: 'sleact' })
export class Channels {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: '채널 id',
  })
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '일반',
    description: '채널 이름',
  })
  @Column('varchar', { name: 'name', length: 30 })
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 0,
    description: '채널 비공개 여부',
  })
  @Column('tinyint', {
    name: 'private',
    nullable: true,
    width: 1,
    default: () => "'0'",
  })
  private: boolean | null;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    example: '2022-08-15T12:23:48.493Z',
    description: '채널 생성 일자',
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

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: '워크스페이스 id',
  })
  @Column('int', { name: 'WorkspaceId', nullable: true })
  WorkspaceId: number | null;

  @OneToMany(() => ChannelChats, (channelchats) => channelchats.Channel)
  ChannelChats: ChannelChats[];

  @IsArray()
  @ApiProperty({
    example: [
      {
        createdAt: '2022-08-15T12:23:48.493Z',
        updatedAt: '2022-08-15T12:23:48.493Z',
        ChannelId: 1,
        UserId: 19,
      },
    ],
    description: '채널 소속 유저 정보',
  })
  @OneToMany(() => ChannelMembers, (channelMembers) => channelMembers.Channel, {
    cascade: ['insert'],
  })
  ChannelMembers: ChannelMembers[];

  @ManyToMany(() => Users, (users) => users.Channels)
  Members: Users[];

  @IsArray()
  @ApiProperty({
    example: [
      {
        id: 1,
        name: 'Sleact',
        url: 'sleact',
        createdAt: '2022-08-15T12:23:48.493Z',
        updatedAt: '2022-08-15T12:23:48.493Z',
        deletedAt: null,
        OwnerId: null,
      },
    ],
    description: '채널이 속해 있는 워크스페이스 정보',
  })
  @ManyToOne(() => Workspaces, (workspaces) => workspaces.Channels, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'WorkspaceId', referencedColumnName: 'id' }])
  Workspace: Workspaces;
}
