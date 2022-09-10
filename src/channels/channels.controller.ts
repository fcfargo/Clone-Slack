import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from 'src/common/decorators/user.decorator';
import { ChannelsService } from './channels.service';
import { PostChatDto } from './dto/post.chat.dto';

@ApiTags('CHANNEL')
@Controller('api/workspaces/:url/channels')
export class ChannelsController {
  constructor(private channelsService: ChannelsService) {}
  @Get()
  getAllChannels() {}

  @Post()
  createChannel() {}

  @Get(':name')
  async getSpecificChannelsByName(@Param() param) {
    return await this.channelsService.getWorkspaceChannel(param.name);
  }

  @Get('channel/:id')
  async getSpecificChannelById(@Param() param) {
    return await this.channelsService.findChannelById(param.id);
  }

  @Get(':name/chats')
  getChat(@Query() query, @Param() param) {
    console.log(query.perPage, query.page);
    console.log(param.id, param.url);
  }

  @Post(':name/chants')
  postChat(@Param('url') url: string, @Param('name') name: string, @Body() body: PostChatDto, @User() user) {
    return this.channelsService.sendChatMessage({ url, name, content: body.content, uid: user.id });
  }

  @Post(':name/chants')
  postImages(@Body() body) {}

  @Get(':name/unreads')
  getUnreads(@Param('url') url: string, @Param('name') name: string, @Query('after') after: number) {
    // return this.channelsService.getChannelUnreadsCount(url, name, after);
  }

  @Get(':name/members')
  getAllMembers(@Param('url') url: string, @Param('name') name: string) {
    return this.channelsService.getWorkspaceChannelMembers(url, name);
  }

  @Post(':name/members')
  inviteMembers() {}
}
