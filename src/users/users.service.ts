import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Users } from '../entities/Users';
import * as bcrypt from 'bcrypt';
import { WorkspaceMembers } from 'src/entities/WorkspaceMembers';
import { ChannelMembers } from 'src/entities/ChannelMembers';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    @InjectRepository(WorkspaceMembers)
    private workspaceMembersRepository: Repository<WorkspaceMembers>,
    @InjectRepository(ChannelMembers)
    private channelMembersRepository: Repository<ChannelMembers>,
    // queryRunner() 사용을 위한 의존성 주입
    private dataSource: DataSource,
  ) {}

  async createUserData(email: string, nickname: string, password: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    // email 중복 확인
    const user = await queryRunner.manager.getRepository(Users).findOne({ where: { email } });

    // 유저가 존재하지 않는 경우
    if (user) {
      throw new UnauthorizedException('이미 존재하는 사용자입니다.');
    }

    // bcrypt 암호화
    const hashedPassword = await bcrypt.hash(password, 12);

    try {
      // 회원 데이터 생성
      const newUser = await queryRunner.manager.getRepository(Users).save({
        email,
        nickname,
        password: hashedPassword,
      });

      // 회원 기본 workspace 제공
      await queryRunner.manager.getRepository(WorkspaceMembers).save({
        UserId: newUser.id,
        WorkspaceId: 1,
      });

      // 회원 기본 channel 제공
      await queryRunner.manager.getRepository(ChannelMembers).save({
        UserId: newUser.id,
        ChannelId: 1,
      });

      await queryRunner.commitTransaction();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { createdAt, updatedAt, deletedAt, ...result } = newUser;
      delete result.password;
      return result;
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('DB가 회원 가입 처리에 실패했습니다.[transaction error]');
    } finally {
      // DB connection 개수 제한이 존재하므로 .release() 필수 처리
      await queryRunner.release();
    }
  }
}
