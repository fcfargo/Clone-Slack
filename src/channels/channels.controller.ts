import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('CHANNEL')
@Controller('api/workspaces/:url/channels')
export class ChannelsController {
  @Get()
  getAllChannels() {}
  @Post()
  createChannel() {}
  @Get(':name')
  getSpecificChannels() {}
  @Get(':name/chats')
  getChat(@Query() query, @Param() param) {
    console.log(query.perPage, query.page);
    console.log(param.id, param.url);
  }

  @Post(':name/chants')
  postChat(@Body() body) {}
  @Get(':name/members')
  inviteMembers() {}
}
