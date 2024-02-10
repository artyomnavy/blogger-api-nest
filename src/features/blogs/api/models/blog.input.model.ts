export class CreateAndUpdateBlogModel {
  name: string;
  description: string;
  websiteUrl: string;
}

export class PaginatorBlogModel {
  searchNameTerm?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  pageNumber?: number;
  pageSize?: number;
}
