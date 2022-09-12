import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Users } from './Users';
import { Channels } from './Channels';
import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Index('UserId', ['UserId'], {})
@Index('ChannelId', ['ChannelId'], {})
@Entity({ schema: 'sleact', name: 'channelchats' })
export class ChannelChats {
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
    description: '메시지 내용',
    example: '안녕 반가워요',
  })
  @Column('text', { name: 'content' })
  content: string;

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
    description: '유저 id',
  })
  @Column('int', { name: 'UserId', nullable: true })
  UserId: number | null;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: '채널 id',
  })
  @Column('int', { name: 'ChannelId', nullable: true })
  ChannelId: number | null;

  @IsArray()
  @ApiProperty({
    example: [
      {
        id: 1,
        email: 'fcfargo90@gmail.com',
        nickname: 'fcfargo',
        createdAt: '2022-08-15T12:23:48.493Z',
        updatedAt: '2022-08-15T12:23:48.493Z',
        deletedAt: null,
      },
    ],
    description: '채팅에 참여한 유저 정보',
  })
  @ManyToOne(() => Users, (users) => users.ChannelChats, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'UserId', referencedColumnName: 'id' }])
  User: Users;

  @ManyToOne(() => Channels, (channels) => channels.ChannelChats, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'ChannelId', referencedColumnName: 'id' }])
  Channel: Channels;
}
