import { PickType } from '@nestjs/swagger';
import { Users } from '../../entities/Users';

export class GetUserResponseDto extends PickType(Users, ['id', 'email', 'nickname', 'Workspaces'] as const) {}
