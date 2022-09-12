import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelChats } from 'src/entities/ChannelChats';
import { ChannelMembers } from 'src/entities/ChannelMembers';
import { Channels } from 'src/entities/Channels';
import { Users } from 'src/entities/Users';
import { WorkspaceMembers } from 'src/entities/WorkspaceMembers';
import { Workspaces } from 'src/entities/Workspaces';
import { EventsGateway } from 'src/events/events.gateway';
import { Repository, DataSource, MoreThan } from 'typeorm';

@Injectable()
export class ChannelsService {
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
    @InjectRepository(ChannelChats)
    private channelChatsRepository: Repository<ChannelChats>,

    private dataSource: DataSource,

    private eventsGateway: EventsGateway,
  ) {}

  /** 유저가 소속된 워크스페이스 채널 모두 가져오기 */
  async getWorkspaceChannels(url: string, uid: number) {
    return this.channelsRepository
      .createQueryBuilder('channel')
      .innerJoinAndSelect('channel.ChannelMembers', 'member', 'member.UserId = :uid', { uid })
      .innerJoinAndSelect('channel.Workspace', 'workspace', 'workspace.url = :url', { url })
      .getMany();
  }

  /** 특정 워크스페이스 채널 가져오기 */
  async getWorkspaceChannel(url: string, name: string) {
    return this.channelsRepository
      .createQueryBuilder('channel')
      .where('channel.name = :name', { name })
      .innerJoinAndSelect('channel.Workspace', 'workspace', 'workspace.url = :url', { url })
      .getOne();
  }

  /** 채널 생성하기 */
  async createWorkspaceChannel(url: string, name: string, uid: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // url로 워크스페이스 가져오기
    const workspace = await queryRunner.manager.getRepository(Workspaces).findOne({ where: { url } });
    if (!workspace) throw new BadRequestException('입력하신 url과 일치하는 워크스페이스가 존재하지 않습니다.');

    // name 중복 확인
    const channel = await queryRunner.manager.getRepository(Channels).findOne({ where: { name } });
    if (channel) throw new BadRequestException('이미 동일한 name을 가진 채널이 존재합니다.');

    try {
      // 채널 생성
      const newChannel = new Channels();
      newChannel.name = name;
      newChannel.WorkspaceId = workspace.id;
      const createdChannel = await queryRunner.manager.getRepository(Channels).save(newChannel);

      // 유저를 채널 멤버로 등록
      const channelMember = new ChannelMembers();
      channelMember.UserId = uid;
      channelMember.ChannelId = createdChannel.id;
      await queryRunner.manager.getRepository(ChannelMembers).save(channelMember);

      await queryRunner.commitTransaction();

      // 생성된 채널 정보 return
      return this.channelsRepository
        .createQueryBuilder('channel')
        .where('channel.name = :name', { name })
        .innerJoinAndSelect('channel.Workspace', 'workspace', 'workspace.url = :url', { url })
        .getOne();
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('DB가 채널 생성 처리에 실패했습니다.[transaction error]');
    } finally {
      await queryRunner.release();
    }
  }

  /** 워크스페이스 채널 멤버 모두 가져오기*/
  async getWorkspaceChannelMembers(url: string, name: string) {
    return this.usersRepository
      .createQueryBuilder('user')
      .innerJoin('user.Channels', 'channels', 'channels.name = :name', { name })
      .innerJoin('channels.Workspace', 'workspace', 'workspace.url = :url', { url })
      .getMany();
  }

  /** 워크스페이스 채널 멤버 생성하기*/
  async createWorkspaceChannelMembers(url: string, name: string, email: string) {
    const channel = await this.channelsRepository
      .createQueryBuilder('channel')
      .innerJoin('channel.Workspace', 'workspace', 'workspace.url = :url', {
        url,
      })
      .where('channel.name = :name', { name })
      .getOne();
    if (!channel) throw new BadRequestException('입력하신 name과 일치하는 채널이 존재하지 않습니다.');

    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .innerJoin('user.Workspaces', 'workspace', 'workspace.url = :url', {
        url,
      })
      .getOne();
    if (!user) throw new BadRequestException('입력하신 email과 일치하는 유저 정보가 존재하지 않습니다.');

    const channelMember = new ChannelMembers();
    channelMember.ChannelId = channel.id;
    channelMember.UserId = user.id;
    await this.channelMembersRepository.save(channelMember);

    // 유저 정보 return
    return this.usersRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.email', 'user.nickname'])
      .where('user.email= :email', { email })
      .innerJoinAndSelect('user.Workspaces', 'workspace')
      .getOne();
  }

  /** 워크스페이스 채널 채팅 모두 가져오기*/
  async getWorkspaceChannelChats(url: string, name: string, perPage: number, page: number) {
    return this.channelChatsRepository
      .createQueryBuilder('channelChats')
      .innerJoin('channelChats.Channel', 'channel', 'channel.name = :name', {
        name,
      })
      .innerJoin('channel.Workspace', 'workspace', 'workspace.url = :url', {
        url,
      })
      .innerJoinAndSelect('channelChats.User', 'user')
      .orderBy('channelChats.createdAt', 'DESC')
      .take(perPage)
      .skip(perPage * (page - 1))
      .getMany();
  }

  /** 워크스페이스 채널 읽지 않은 채팅 개수 가져오기*/
  async getChannelUnreadsCount(url: string, name: string, after: number) {
    const channel = await this.channelsRepository
      .createQueryBuilder('channel')
      .innerJoin('channel.Workspace', 'workspace', 'workspace.url = :url', {
        url,
      })
      .where('channel.name = :name', { name })
      .getOne();
    return this.channelChatsRepository.count({
      where: {
        ChannelId: channel.id,
        createdAt: MoreThan(new Date(after)),
      },
    });
  }

  /** 워크스페이스 채널 채팅 생성하기(넘겨받은 데이터를 DB에 저장 후 메시지를 웹 소켓으로 실시간 전송)*/
  async createWorkspaceChannelChats(url: string, name: string, content: string, myId: number) {
    const channel = await this.channelsRepository
      .createQueryBuilder('channel')
      .innerJoin('channel.Workspace', 'workspace', 'workspace.url = :url', {
        url,
      })
      .where('channel.name = :name', { name })
      .getOne();
    const chats = new ChannelChats();
    chats.content = content;
    chats.UserId = myId;
    chats.ChannelId = channel.id;
    const savedChat = await this.channelChatsRepository.save(chats);
    const chatWithUser = await this.channelChatsRepository.findOne({
      where: { id: savedChat.id },
      relations: ['User', 'Channel'],
    });
    // socket.io를 통해 메시지를 웻 소켓으로 실시간 전송 -> 프론트엔드에서 전송된 데이터를 url 및 name 과 일치하는 채널 사용자들이 볼 수 있도록 수신자 범위 조정해줌
    this.eventsGateway.server
      // .of(`/ws-${url}`)
      .to(`/ws-${url}-${chatWithUser.ChannelId}`)
      .emit('message', chatWithUser);
  }
}
