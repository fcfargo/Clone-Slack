import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Users } from '../entities/Users';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(Users) private usersRepository: Repository<Users>) {}

  async validateUser(email: string, password: string) {
    // router 요청이 발생하면 DB에서 email로 유저 정보를 검색
    const user = await this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'nickname'],
    });
    if (!user) {
      return null;
    }
    const result = await bcrypt.compare(password, user.password);
    if (result) {
      const { password, ...userWithoutPassword } = user;
      // user 내부 데이터 중 password를 제외한 나머지를 반환(=delete user.password )
      return userWithoutPassword;
    }
    return null;
  }
}
