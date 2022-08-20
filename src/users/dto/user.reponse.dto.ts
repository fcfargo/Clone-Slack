import { PickType } from '@nestjs/swagger';
import { Users } from '../../entities/Users';

export class UserResponseDto extends PickType(Users, ['id', 'email', 'nickname', 'password'] as const) {}
