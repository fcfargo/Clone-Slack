import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelChats } from 'src/entities/ChannelChats';
import { ChannelMembers } from 'src/entities/ChannelMembers';
import { Channels } from 'src/entities/Channels';
import { Users } from 'src/entities/Users';
import { WorkspaceMembers } from 'src/entities/WorkspaceMembers';
import { Workspaces } from 'src/entities/Workspaces';
import { Repository, DataSource } from 'typeorm';

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

    private dataSoruce: DataSource,
  ) {}

  async findChannelById(id: number) {
    return this.channelsRepository.findOne({ where: { id } });
  }

  async getWorkspaceChannels(url: string, uid: number) {
    return this.channelsRepository
      .createQueryBuilder('channel')
      .innerJoinAndSelect('channel.ChannelMembers', 'member', 'member.UserId = :uid', { uid })
      .innerJoinAndSelect('channel.Workspace', 'workspace', 'workspace.url = :url', { url })
      .getMany();
  }

  async getWorkspaceChannel(name: string) {
    return this.channelsRepository
      .createQueryBuilder('channel')
      .where('channel.name = :name', { name })
      .innerJoinAndSelect('channel.Workspace', 'workspace')
      .getOne();
  }

  async createWorkspaceChannel(url: string, name: string, uid: number) {
    // url로 워크스페이스 가져오기
    const workspace = await this.workspacesRepository.findOne({ where: { url } });

    // 채널 생성
    const channel = new Channels();
    channel.name = name;
    channel.WorkspaceId = workspace.id;
    const createdChannel = await this.channelsRepository.save(channel);

    // 유저를 채널 멤버로 등록
    const channelMember = new ChannelMembers();
    channelMember.UserId = uid;
    channelMember.ChannelId = createdChannel.id;
    await this.channelMembersRepository.save(channelMember);
  }

  async getWorkspaceChannelMembers(url: string, name: string) {
    return this.usersRepository
      .createQueryBuilder('user')
      .innerJoin('user.Channels', 'channels', 'channels.name = :name', { name })
      .innerJoin('channels.Workspace', 'workspace', 'workspace.url = :url', { url })
      .getMany();
  }

  // 넘겨받은 데이터를 DB에 저장 후 웹 소켓으로 전송
  async sendChatMessage({ url, name, content, uid }) {
    const channel = await this.channelsRepository
      .createQueryBuilder('channel')
      .innerJoin('channel.Workspace', 'workspace', 'workspace.url = :url', { url })
      .where('channel.name = :name', { name })
      .getOne();
    if (!channel) throw new NotFoundException('채널이 존재하지 않습니다.');

    const chats = new ChannelChats();
    chats.content = content;
    chats.UserId = uid;
    const createdChat = await this.channelChatsRepository.save(chats);
    const chatWithUser = await this.channelChatsRepository.findOne({ where: { id: createdChat.id }, relations: ['User', 'Channel'] });

    // socket.io를 통해 웻 소켓으로 전송 -> 프론트엔드에서 전송된 데이터를 url 및 name 과 일치하는 채널 사용자들이 볼 수 있도록 수신자 범위 조정해줌
  }
}
