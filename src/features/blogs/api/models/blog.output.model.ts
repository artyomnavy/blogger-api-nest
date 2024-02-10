import { BlogDocument } from '../../domain/blog.entity';
import { ObjectId } from 'mongodb';

export class Blog {
  constructor(
    public _id: ObjectId,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean,
  ) {}
}

export class BlogModel {
  _id: ObjectId;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
}
export class BlogOutputModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
}

export class PaginatorBlogOutputModel {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: BlogOutputModel[];
}

export const blogMapper = (blog: BlogDocument): BlogOutputModel => {
  const blogOutputModel = new BlogOutputModel();

  blogOutputModel.id = blog._id.toString();
  blogOutputModel.name = blog.name;
  blogOutputModel.description = blog.description;
  blogOutputModel.websiteUrl = blog.websiteUrl;
  blogOutputModel.createdAt = blog.createdAt;
  blogOutputModel.isMembership = blog.isMembership;

  return blogOutputModel;
};
