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
  UseGuards,
} from '@nestjs/common';
import { CommentsQueryRepository } from '../infrastructure/comments.query-repository';
import { ObjectIdPipe } from '../../../common/pipes/object-id.pipe';
import { UpdateLikeModel } from '../../likes/api/models/like.input.model';
import { HTTP_STATUSES } from '../../../utils';
import { CommentsService } from '../application/comments.service';
import { CreateAndUpdateCommentModel } from './models/comment.input.model';
import { JwtBearerAuthGuard } from '../../../common/guards/jwt-bearer-auth-guard.service';
import { CurrentUserId } from '../../../common/decorators/current-user-id.param.decorator';

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

  @Put(':id/like-status')
  @UseGuards(JwtBearerAuthGuard)
  @HttpCode(HTTP_STATUSES.NO_CONTENT_204)
  async changeLikeStatusForComment(
    @Param('id', ObjectIdPipe) commentId: string,
    @Body() updateData: UpdateLikeModel,
    @CurrentUserId() currentUserId: string,
  ) {
    const comment = await this.commentsQueryRepository.getCommentById(
      commentId,
      currentUserId,
    );

    if (!comment) throw new NotFoundException('Comment not found');

    const isUpdated = await this.commentsService.changeLikeStatusCommentForUser(
      currentUserId,
      comment,
      updateData.likeStatus,
    );

    if (isUpdated) return;
  }

  @Put(':id')
  @UseGuards(JwtBearerAuthGuard)
  @HttpCode(HTTP_STATUSES.NO_CONTENT_204)
  async updateComment(
    @Param('id', ObjectIdPipe) commentId: string,
    @CurrentUserId() currentUserId: string,
    @Body() updateData: CreateAndUpdateCommentModel,
  ) {
    const comment = await this.commentsQueryRepository.getCommentById(
      commentId,
      currentUserId,
    );

    if (!comment) {
      throw new NotFoundException('Comment not found');
    } else if (comment.commentatorInfo.userId !== currentUserId) {
      throw new ForbiddenException('Comment is not yours');
    }

    const isUpdated = await this.commentsService.updateComment(
      commentId,
      updateData,
    );

    if (isUpdated) return;
  }

  @Delete()
  @UseGuards(JwtBearerAuthGuard)
  @HttpCode(HTTP_STATUSES.NO_CONTENT_204)
  async deleteComment(
    @Param('id', ObjectIdPipe) commentId: string,
    @CurrentUserId() currentUserId: string,
  ) {
    const comment = await this.commentsQueryRepository.getCommentById(
      commentId,
      currentUserId,
    );

    if (!comment) {
      throw new NotFoundException('Comment not found');
    } else if (comment.commentatorInfo.userId !== currentUserId) {
      throw new ForbiddenException('Comment is not yours');
    }

    const isDeleted = await this.commentsService.deleteComment(commentId);

    if (isDeleted) return;
  }
}
