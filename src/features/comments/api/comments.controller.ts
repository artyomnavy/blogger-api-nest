import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { CommentsQueryRepository } from '../infrastructure/comments.queryRepository';

@Controller('comments')
export class CommentsController {
  constructor(protected commentsQueryRepository: CommentsQueryRepository) {}
  @Get(':id')
  async getComment(@Param('id') commentId: string) {
    const comment =
      await this.commentsQueryRepository.getCommentById(commentId);

    if (!comment) {
      throw new NotFoundException('Blog not found');
      return;
    } else {
      return comment;
    }
  }
}
