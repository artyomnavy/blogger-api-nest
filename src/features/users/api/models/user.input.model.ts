export class PaginatorUserModel {
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  pageNumber?: number;
  pageSize?: number;
  searchLoginTerm?: string;
  searchEmailTerm?: string;
}

export class CreateUserModel {
  login: string;
  password: string;
  email: string;
}
