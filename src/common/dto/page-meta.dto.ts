

export class PageMetaDto {
  readonly pageNo: number;
  readonly pageSize: number;
  readonly totalElements: number;
  readonly totalPages: number;
  readonly isLast: boolean;

  constructor(pageNo: number, pageSize: number, totalElements: number) {
    this.pageNo = pageNo;
    this.pageSize = pageSize;
    this.totalElements = totalElements;
    this.totalPages = Math.ceil(totalElements / pageSize) || 1;
    this.isLast = this.pageNo >= (this.totalPages - 1);
  }
}