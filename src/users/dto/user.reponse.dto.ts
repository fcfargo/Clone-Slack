import { ApiProperty } from '@nestjs/swagger';
import { JoinRequestDto } from './join.request.dto';

export class UserResponseDto extends JoinRequestDto {
  @ApiProperty({
    example: 1,
    description: '유저 id',
    required: true,
  })
  public id: number;
}
