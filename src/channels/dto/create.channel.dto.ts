import { PickType } from '@nestjs/swagger';
import { Channels } from 'src/entities/Channels';

export class CreateChannelDto extends PickType(Channels, ['name'] as const) {}
