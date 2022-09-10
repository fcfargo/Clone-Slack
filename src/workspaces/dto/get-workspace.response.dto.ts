import { PickType } from '@nestjs/swagger';
import { Workspaces } from 'src/entities/Workspaces';

export class GetWorkspaceResponseDto extends PickType(Workspaces, ['id', 'name', 'url', 'createdAt', 'updatedAt', 'deletedAt', 'OwnerId'] as const) {}
