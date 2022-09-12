import { PickType } from '@nestjs/swagger';
import { ChannelChats } from 'src/entities/ChannelChats';

export class GetChatsResponseDto extends PickType(ChannelChats, [
  'id',
  'content',
  'createdAt',
  'updatedAt',
  'UserId',
  'ChannelId',
  'User',
] as const) {}
