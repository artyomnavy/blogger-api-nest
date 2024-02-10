export class CreateAndUpdatePostModel {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}

export class PaginatorPostModel {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}
