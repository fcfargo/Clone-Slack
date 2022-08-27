import { Injectable } from '@nestjs/common';
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

    private dataSoruce: DataSource,
  ) {}

  async findWorkspaceById(id: number) {
    // findOne({where: { id }}) == find({where: { id }, take: 1 })
    return this.workspacesRepository.findOne({ where: { id } });
  }

  async findUserWorspacesByUid(uid: number) {
    // sequelize에서 JOIN을 include 절로 구현했던 것과 달리, typeORM에선 @entity 객체에서 @OneToMany()로 정의한 변수로 간단하게 구현 가능하다.
    return this.workspacesRepository.findOne({ where: { WorkspaceMembers: [{ UserId: uid }] } });
  }
}
