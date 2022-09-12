import { PickType } from '@nestjs/swagger';
import { Channels } from 'src/entities/Channels';

export class GetChannelsResponseDto extends PickType(Channels, [
  'id',
  'name',
  'private',
  'createdAt',
  'updatedAt',
  'WorkspaceId',
  'ChannelMembers',
  'Workspace',
] as const) {}
