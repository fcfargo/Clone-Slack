import { Controller, Post, Get, Delete, Body, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoggedInGuard } from 'src/auth/logged-in.guard';
import { NotLoggedInGuard } from 'src/auth/not-logged-in.guard';
import { User } from 'src/common/decorators/user.decorator';
import { Users } from 'src/entities/Users';
import { CreateWorkspaceDto } from './dto/create.workspace.dto';
import { WorkspacesService } from './workspaces.service';

@ApiTags('WORKSPACE')
@Controller('api/workspaces')
export class WorkspacesController {
  constructor(private workspacesService: WorkspacesService) {}

  @UseGuards(new LoggedInGuard())
  @Get()
  async getMyWorkspaces(@User() user: Users) {
    return await this.workspacesService.findUserWorspacesByUid(user.id);
  }

  @UseGuards(new NotLoggedInGuard())
  @Post()
  async createMyWorkspace(@User() user: Users, @Body() body: CreateWorkspaceDto) {}

  @Get(':url/members')
  getAllMembersFromWorkspace() {}

  @Post(':url/members')
  inviteMembersToWorkspace() {}

  @Delete(':url/members/:id')
  kickMemberFromWorkspace() {}

  @Get(':url/members/:id')
  getMemberInfoInWorkspace() {}
}
