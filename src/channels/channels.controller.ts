import { Body, Controller, Get, Param, UseGuards, Post, Query, ParseIntPipe } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoggedInGuard } from 'src/auth/logged-in.guard';
import { User } from 'src/common/decorators/user.decorator';
import { Users } from 'src/entities/Users';
import { GetUserResponseDto } from 'src/users/dto/get-user.response.dto';
import { InviteRequestDto } from 'src/users/dto/invite.request.dto';
import { UserResponseDto } from 'src/users/dto/user.reponse.dto';
import { ChannelsService } from './channels.service';
import { CreateChannelDto } from './dto/create.channel.dto';
import { GetChannelResponseDto } from './dto/get-channel.response.dto';
import { GetChannelsResponseDto } from './dto/get-channels.response.dto';
import { GetChatsResponseDto } from './dto/get-chats.response.dto';
import { PostChatDto } from './dto/post.chat.dto';

@ApiTags('CHANNELS')
@ApiCookieAuth('connect.sid')
@UseGuards(new LoggedInGuard())
@Controller('api/workspaces/:url/channels')
export class ChannelsController {
  constructor(private channelsService: ChannelsService) {}

  @ApiResponse({ status: 500, description: '서버 에러' })
  @ApiResponse({ status: 200, description: '성공', type: GetChannelsResponseDto })
  @ApiOperation({ summary: '워크스페이스 채널 모두 가져오기' })
  @Get()
  async getWorkspaceChannels(@User() user: Users, @Param('url') url) {
    return await this.channelsService.getWorkspaceChannels(url, user.id);
  }

  @ApiResponse({ status: 500, description: '서버 에러' })
  @ApiResponse({ status: 201, description: '성공', type: GetChannelResponseDto })
  @ApiOperation({ summary: '워크스페이스 채널 만들기' })
  @Post()
  async createWorkspaceChannel(@Param('url') url: string, @Body() body: CreateChannelDto, @User() user: Users) {
    return await this.channelsService.createWorkspaceChannel(url, body.name, user.id);
  }

  @ApiResponse({ status: 500, description: '서버 에러' })
  @ApiResponse({ status: 200, description: '성공', type: GetChannelResponseDto })
  @ApiOperation({ summary: '워크스페이스 특정 채널 가져오기' })
  @Get(':name')
  async getSpecificChannelsByName(@Param('url') url: string, @Param('name') name: string) {
    return await this.channelsService.getWorkspaceChannel(url, name);
  }

  @ApiResponse({ status: 500, description: '서버 에러,' })
  @ApiResponse({ status: 200, description: '성공', type: UserResponseDto })
  @ApiOperation({ summary: '워크스페이스 채널 멤버 가져오기' })
  @Get(':name/members')
  async getWorkspaceChannelMembers(@Param('url') url: string, @Param('name') name: string) {
    return this.channelsService.getWorkspaceChannelMembers(url, name);
  }

  @ApiResponse({ status: 500, description: '서버 에러,' })
  @ApiResponse({ status: 201, description: '성공', type: GetUserResponseDto })
  @ApiOperation({ summary: '워크스페이스 채널 멤버 초대하기' })
  @Post(':name/members')
  async createWorkspaceChannelMembers(@Param('url') url: string, @Param('name') name: string, @Body() body: InviteRequestDto) {
    return this.channelsService.createWorkspaceChannelMembers(url, name, body.email);
  }

  @ApiResponse({ status: 500, description: '서버 에러,' })
  @ApiResponse({ status: 200, description: '성공', type: GetChatsResponseDto })
  @ApiOperation({ summary: '워크스페이스 특정 채널 채팅 모두 가져오기' })
  @Get(':name/chats')
  async getWorkspaceChannelChats(
    @Param('url') url: string,
    @Param('name') name: string,
    @Query('perPage', ParseIntPipe) perPage: number,
    @Query('page', ParseIntPipe) page: number,
  ) {
    return this.channelsService.getWorkspaceChannelChats(url, name, perPage, page);
  }

  @ApiResponse({ status: 500, description: '서버 에러,' })
  @ApiResponse({ status: 200, description: '성공', schema: { example: 1, description: '읽지 않은 채팅 개수' } })
  @ApiOperation({ summary: '안 읽은 개수 가져오기' })
  @Get(':name/unreads')
  async getUnreads(@Param('url') url: string, @Param('name') name: string, @Query('after', ParseIntPipe) after: number) {
    return this.channelsService.getChannelUnreadsCount(url, name, after);
  }

  // @ApiResponse({ status: 500, description: '서버 에러,' })
  // @ApiResponse({ status: 201, description: '성공' })
  // @ApiOperation({ summary: '워크스페이스 특정 채널 채팅 생성하기' })
  // @Post(':name/chats')
  // async createWorkspaceChannelChats(@Param('url') url: string, @Param('name') name: string, @Body() body: PostChatDto, @User() user: Users) {
  //   return this.channelsService.createWorkspaceChannelChats(url, name, body.content, user.id);
  // }

  // @ApiResponse({ status: 500, description: '서버 에러,' })
  // @ApiResponse({ status: 200, description: '성공' })
  // @ApiOperation({ summary: '워크스페이스 특정 채널 이미지 업로드하기' })
  // @UseInterceptors(
  //   FilesInterceptor('image', 10, {
  //     storage: multer.diskStorage({
  //       destination(req, file, cb) {
  //         cb(null, 'uploads/');
  //       },
  //       filename(req, file, cb) {
  //         const ext = path.extname(file.originalname);
  //         cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
  //       },
  //     }),
  //     limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  //   }),
  // )

  // @ApiResponse({ status: 500, description: '서버 에러,' })
  // @ApiResponse({ status: 200, description: '성공' })
  // @Post(':url/channels/:name/images')
  // async createWorkspaceChannelImages(@Param('url') url, @Param('name') name, @UploadedFiles() files: Express.Multer.File[], @User() user: Users) {
  //   return this.channelsService.createWorkspaceChannelImages(url, name, files, user.id);
  // }
}
