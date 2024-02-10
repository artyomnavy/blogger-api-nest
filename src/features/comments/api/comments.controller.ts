import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { CommentsQueryRepository } from '../infrastructure/comments.queryRepository';
import { ObjectIdPipe } from '../../../common/pipes/objectId.pipe';

@Controller('comments')
export class CommentsController {
  constructor(protected commentsQueryRepository: CommentsQueryRepository) {}
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
}
