import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentsQueryRepository } from '../infrastructure/comments.query-repository';
import { ObjectIdPipe } from '../../../common/pipes/objectId.pipe';
import { UpdateLikeModel } from '../../likes/api/models/like.input.model';
import { Request } from 'express';
import { HTTP_STATUSES } from '../../../utils';
import { CommentsService } from '../application/comments.service';
import { CreateAndUpdateCommentModel } from './models/comment.input.model';
import { BearerAuthGuard } from '../../../common/guards/bearer-auth.guard';

@Controller('comments')
export class CommentsController {
  constructor(
    protected commentsQueryRepository: CommentsQueryRepository,
    protected commentsService: CommentsService,
  ) {}

  @Get(':id')
  async getComment(@Param('id', ObjectIdPipe) commentId: string) {
    const comment =
      await this.commentsQueryRepository.getCommentById(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    } else {
      return comment;
    }
  }

  @Put('/:id/like-status')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HTTP_STATUSES.NO_CONTENT_204)
  async changeLikeStatusForComment(
    @Param('id', ObjectIdPipe) commentId: string,
    @Body() updateData: UpdateLikeModel,
    @Req() req: Request,
  ) {
    const userId = req.userId!;

    const comment = await this.commentsQueryRepository.getCommentById(
      commentId,
      userId,
    );

    if (!comment) throw new NotFoundException('Comment not found');

    const isUpdated = await this.commentsService.changeLikeStatusCommentForUser(
      userId,
      comment,
      updateData.likeStatus,
    );

    if (isUpdated) return;
  }

  @Put('/:id')
  @UseGuards(BearerAuthGuard)
  @HttpCode(HTTP_STATUSES.NO_CONTENT_204)
  async updateComment(
    @Param('id', ObjectIdPipe) commentId: string,
    @Body() updateData: CreateAndUpdateCommentModel,
    @Req() req: Request,
  ) {
    const userId = req.userId!;

    const comment = await this.commentsQueryRepository.getCommentById(
      commentId,
      userId,
    );

    if (!comment) {
      throw new NotFoundException('Comment not found');
    } else if (comment.commentatorInfo.userId !== userId) {
      throw new ForbiddenException('Comment is not yours');
    }

    const isUpdated = await this.commentsService.updateComment(
      commentId,
      updateData,
    );

    if (isUpdated) return;
  }

  @Delete()
  @UseGuards(BearerAuthGuard)
  @HttpCode(HTTP_STATUSES.NO_CONTENT_204)
  async deleteComment(
    @Param('id', ObjectIdPipe) commentId: string,
    @Req() req: Request,
  ) {
    const userId = req.userId!;

    const comment = await this.commentsQueryRepository.getCommentById(
      commentId,
      userId,
    );

    if (!comment) {
      throw new NotFoundException('Comment not found');
    } else if (comment.commentatorInfo.userId !== userId) {
      throw new ForbiddenException('Comment is not yours');
    }

    const isDeleted = await this.commentsService.deleteComment(commentId);

    if (isDeleted) return;
  }
}
