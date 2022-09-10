import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelMembers } from 'src/entities/ChannelMembers';
import { Channels } from 'src/entities/Channels';
import { Users } from 'src/entities/Users';
import { WorkspaceMembers } from 'src/entities/WorkspaceMembers';
import { Workspaces } from 'src/entities/Workspaces';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspaces)
    private workspacesRepository: Repository<Workspaces>,
    @InjectRepository(Channels)
    private channelsRepository: Repository<Channels>,
    @InjectRepository(WorkspaceMembers)
    private workspaceMembersRepository: Repository<WorkspaceMembers>,
    @InjectRepository(ChannelMembers)
    private channelMembersRepository: Repository<ChannelMembers>,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,

    private dataSource: DataSource,
  ) {}

  /** id로 워크스페이스 정보 가져오기 */
  async findWorkspaceById(id: number) {
    return this.workspacesRepository.findOne({ where: { id } });
  }

  /** uid로 유저가 속해있는 워크스페이스 목록 가져오기 */
  async findMyWorspacesByUid(uid: number) {
    // sequelize에서 JOIN을 include 절로 구현했던 것과 달리, typeORM에선 @entity 객체에서 @OneToMany()로 정의한 변수로 간단하게 구현 가능하다.
    return this.workspacesRepository.findOne({ where: { WorkspaceMembers: [{ UserId: uid }] } });
  }

  /** 워크스페이스 정보 생성하기 */
  async createWorkspaceData(name: string, url: string, uid: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // 워크스페이스 name, url 중복 확인
    const workspace = await queryRunner.manager.getRepository(Workspaces).findOne({ where: [{ name }, { url }] });
    if (workspace) throw new BadRequestException('이미 동일한 name 혹은 url을 가진 워크스페이스가 존재합니다.');

    try {
      // 워크스페이스 생성
      const newWorkspace = queryRunner.manager.getRepository(Workspaces).create({
        name,
        url,
        OwnerId: uid,
      });
      // create() 메서드의 단점: save() 함수 사용해야 DB에 데이터가 저장됨
      const createdWorkspace = await queryRunner.manager.getRepository(Workspaces).save(newWorkspace);

      // 유저를 워스크페이스에 등록
      const workspaceMemeber = new WorkspaceMembers();
      workspaceMemeber.WorkspaceId = createdWorkspace.id;
      workspaceMemeber.UserId = uid;

      // 채널 생성
      const channel = new Channels();
      channel.name = '일반';
      channel.WorkspaceId = createdWorkspace.id;
      const [, createdChannel] = await Promise.all([
        queryRunner.manager.getRepository(WorkspaceMembers).save(workspaceMemeber),
        queryRunner.manager.getRepository(Channels).save(channel),
      ]);

      // 유저를 채널에 등록
      const channelMember = new ChannelMembers();
      channelMember.ChannelId = createdChannel.id;
      channelMember.UserId = uid;
      await queryRunner.manager.getRepository(ChannelMembers).save(channelMember);

      await queryRunner.commitTransaction();

      // 생성된 워크스페이스 정보 return
      return this.workspacesRepository
        .createQueryBuilder('workspace')
        .innerJoin('workspace.WorkspaceMembers', 'members', 'members.UserId = :uid', { uid })
        .getOne();
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('DB가 워크스페이스 생성 처리에 실패했습니다.[transaction error]');
    } finally {
      await queryRunner.release();
    }
  }

  /** 워크스페이스 멤버 가져오기 */
  async getWorksapaceMemebersByUrl(url: string) {
    // user: 사용자 임의 정의 변수(alias), members: 사용자 임의 정의 변수(alias), WorspaceMembers: typeORM에선 @entity 객체에서 @OneToMany()로 정의한 변수
    return this.usersRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.email', 'user.nickname'])
      .innerJoin('user.WorkspaceMembers', 'members')
      .innerJoin('members.Workspace', 'workspace', 'workspace.url = :url', { url })
      .getMany();
  }

  /** 워크스페이스 멤버 생성하기 */
  async createWorkspaceMember(url: string, email: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const workspace = await queryRunner.manager.getRepository(Workspaces).findOne({
      where: { url },
      join: {
        alias: 'workspace',
        innerJoinAndSelect: {
          channels: 'workspace.Channels',
        },
      },
    });
    // url과 일치하는 워크스페이스가 존재하지 않는 경우
    if (!workspace) throw new BadRequestException('url과 일치하는 워크스페이스가 존재하지 않습니다.');

    const user = await queryRunner.manager.getRepository(Users).findOne({ where: { email } });
    // email과 일치하는 유저가 존재하지 않는 경우
    if (!user) throw new BadRequestException('email과 일치하는 유저가 존재하지 않습니다.');

    try {
      // 유저를 워스크페이스에 등록
      const workspaceMemeber = new WorkspaceMembers();
      workspaceMemeber.WorkspaceId = workspace.id;
      workspaceMemeber.UserId = user.id;

      // 유저를 채널에 등록
      const channelMember = new ChannelMembers();
      channelMember.ChannelId = workspace.Channels.find((v) => v.name === '일반').id;
      channelMember.UserId = user.id;

      await Promise.all([
        queryRunner.manager.getRepository(WorkspaceMembers).save(workspaceMemeber),
        queryRunner.manager.getRepository(ChannelMembers).save(channelMember),
      ]);

      await queryRunner.commitTransaction();

      // 유저 정보 return
      return this.usersRepository
        .createQueryBuilder('user')
        .select(['user.id', 'user.email', 'user.nickname'])
        .where('user.email= :email', { email })
        .innerJoinAndSelect('user.Workspaces', 'workspace')
        .getOne();
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('DB가 워크스페이스 멤버 생성 처리에 실패했습니다.[transaction error]');
    } finally {
      await queryRunner.release();
    }
  }

  /** 워크스페이스 멤버 퇴장시키기 */
  async deleteWorkspaceMemberById(url: string, id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // 워크스페이스가 존재 여부 확인
    const workspace = await queryRunner.manager.getRepository(Workspaces).findOne({
      where: { url },
      join: {
        alias: 'workspace',
        innerJoinAndSelect: {
          channels: 'workspace.Channels',
        },
      },
    });
    if (!workspace) throw new BadRequestException('url과 일치하는 워크스페이스가 존재하지 않습니다.');

    // uid 존재 여부 확인
    const user = await queryRunner.manager.getRepository(Users).findOne({ where: { id } });
    if (!user) throw new BadRequestException('id과 일치하는 유저가 존재하지 않습니다.');

    try {
      // 유저가 등록됐던 워크스페이스와 채널에서 삭제
      await Promise.all([
        queryRunner.manager.getRepository(WorkspaceMembers).delete({ UserId: id, WorkspaceId: workspace.id }),
        queryRunner.manager.getRepository(ChannelMembers).delete({ UserId: id, ChannelId: workspace.Channels.find((v) => v.name === '일반').id }),
      ]);
      await queryRunner.commitTransaction();
      return;
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('DB가 워크스페이스 멤버 삭제 처리에 실패했습니다.[transaction error]');
    } finally {
      await queryRunner.release();
    }
  }

  /** 워크스페이스 특정 멤버 가져오기 */
  async getWorksapaceMemberById(url: string, id: number) {
    return this.usersRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.email', 'user.nickname'])
      .where('user.id = :id', { id })
      .innerJoinAndSelect('user.Workspaces', 'workspace', 'workspace.url = :url', { url })
      .getOne();
  }
}
