import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Users } from '../entities/Users';
import { AuthService } from './auth.service';
import { LocalSerializer } from './local.serializer';
import { LocalStrategy } from './local.strategy';

@Module({
  // JWT  token 사용자: session: false로 설정하면 session에 저장 안됨
  imports: [PassportModule.register({ session: true }), TypeOrmModule.forFeature([Users])],
  providers: [AuthService, LocalStrategy, LocalSerializer],
})
export class AuthModule {}
