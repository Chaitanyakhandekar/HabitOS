export class ApiResponse {
  constructor(statusCode, data = {}, message = 'Success', meta = {}) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }

  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
      meta: this.meta,
    });
  }
}

export default ApiResponse;
