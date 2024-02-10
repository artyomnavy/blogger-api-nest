import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { ObjectId } from 'mongodb';

@Injectable()
export class ObjectIdPipe implements PipeTransform {
  transform(id: string) {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException();
    }

    return id;
  }
}
