export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  records: T[];
  page: number;
  pageSize: number;
  totalRecords: number;
}
