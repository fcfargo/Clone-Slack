import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../entities/Users';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}

  getUser() {}

  async createUserData(email: string, nickname: string, password: string) {
    // email 중복 확인
    const user = await this.usersRepository.findOne({ where: { email } });
    console.log(user);

    // 유저가 존재하지 않는 경우
    if (user) {
      throw new BadRequestException('이미 존재하는 사용자입니다.');
    }

    // bcrypt 암호화
    const hashedPassword = await bcrypt.hash(password, 12);

    // 회원 데이터 생성
    const newUser = await this.usersRepository.save({
      email,
      nickname,
      password: hashedPassword,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdAt, updatedAt, deletedAt, ...result } = newUser;
    delete result.password;
    return result;
  }
}
