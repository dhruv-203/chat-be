export class ApiError extends Error {
  statusCode: number;
  data?: any;
  constructor(statusCode: number, message: string, data: any) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
  }
  get JSON() {
    return {
      statusCode: this.statusCode,
      data: this.data,
      message: this.message,
    };
  }
}
