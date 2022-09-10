import { PickType } from '@nestjs/swagger';
import { Users } from 'src/entities/Users';
import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto extends PickType(Users, ['email'] as const) {
  @ApiProperty({
    example: '1q2w3e4r!',
    description: '비밀번호',
    required: true,
  })
  public password: string;
}
