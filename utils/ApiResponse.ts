export class ApiResponse {
  statusCode: number;
  data?: any;
  constructor(statusCode: number, data: any) {
    this.statusCode = statusCode;
    this.data = data;
  }
}
