import { Controller, Post, Get, Delete, Body, UseGuards, Param, ParseIntPipe } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { LoggedInGuard } from 'src/auth/logged-in.guard';
import { User } from 'src/common/decorators/user.decorator';
import { Users } from 'src/entities/Users';
import { GetUserResponseDto } from 'src/users/dto/get-user.response.dto';
import { InviteRequestDto } from 'src/users/dto/invite.request.dto';
import { UserResponseDto } from 'src/users/dto/user.reponse.dto';
import { CreateWorkspaceDto } from './dto/create.workspace.dto';
import { GetWorkspaceResponseDto } from './dto/get-workspace.response.dto';
import { WorkspacesService } from './workspaces.service';

@ApiTags('WORKSPACES')
@ApiCookieAuth('connect.sid')
@UseGuards(new LoggedInGuard())
@Controller('api/workspaces')
export class WorkspacesController {
  constructor(private workspacesService: WorkspacesService) {}

  @ApiResponse({ status: 500, description: '서버 에러' })
  @ApiResponse({ status: 200, description: '성공', type: GetWorkspaceResponseDto })
  @ApiOperation({ summary: '내 워크스페이스 목록 가져오기' })
  @Get()
  async getMyWorkspaces(@User() user: Users) {
    return await this.workspacesService.findMyWorspacesByUid(user.id);
  }

  @ApiResponse({ status: 500, description: '서버 에러' })
  @ApiResponse({ status: 201, description: '성공', type: GetWorkspaceResponseDto })
  @ApiOperation({ summary: '워크스페이스 생성' })
  @Post()
  async createMyWorkspace(@User() user: Users, @Body() body: CreateWorkspaceDto) {
    return await this.workspacesService.createWorkspaceData(body.name, body.url, user.id);
  }

  @ApiResponse({ status: 500, description: '서버 에러' })
  @ApiResponse({
    status: 201,
    description: '성공',
    type: UserResponseDto,
  })
  @ApiOperation({ summary: '워크스페이스 멤버 가져오기' })
  @Get(':url/members')
  async getAllMembersFromWorkspace(@Param('url') url: string) {
    return await this.workspacesService.getWorksapaceMemebersByUrl(url);
  }

  @ApiResponse({ status: 500, description: '서버 에러' })
  @ApiResponse({
    status: 201,
    description: '성공',
    type: GetUserResponseDto,
  })
  @ApiOperation({ summary: '워크스페이스 멤버 초대하기' })
  @Post(':url/members')
  async createWorkspaceMembers(@Param('url') url: string, @Body() body: InviteRequestDto) {
    return await this.workspacesService.createWorkspaceMember(url, body.email);
  }

  @ApiResponse({ status: 500, description: '서버 에러' })
  @ApiResponse({
    status: 200,
    description: '성공',
    schema: { properties: { success: { type: 'boolean', example: true }, message: { type: 'string', example: 'DELETE CLEAR' } } },
  })
  @ApiOperation({ summary: '워크스페이스 특정 멤버 퇴장시키기' })
  @Delete(':url/members/:id')
  async deleteWorkspaceMembersFromWorkspace(@Param('url') url: string, @Param('id', ParseIntPipe) id: number) {
    await this.workspacesService.deleteWorkspaceMemberById(url, id);
    return { success: true, message: 'DELETE CLEAR' };
  }

  @ApiResponse({ status: 500, description: '서버 에러' })
  @ApiResponse({
    status: 200,
    description: '성공',
    type: GetUserResponseDto,
  })
  @ApiOperation({ summary: '워크스페이스 특정 멤버 가져오기' })
  @Get(':url/members/:id')
  async getSpecificMemberFromWorkspace(@Param('url') url: string, @Param('id', ParseIntPipe) id: number) {
    return await this.workspacesService.getWorksapaceMemberById(url, id);
  }
}
