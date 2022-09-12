import { PickType } from '@nestjs/swagger';
import { Channels } from 'src/entities/Channels';

export class GetChannelResponseDto extends PickType(Channels, [
  'id',
  'name',
  'private',
  'createdAt',
  'updatedAt',
  'WorkspaceId',
  'Workspace',
] as const) {}
