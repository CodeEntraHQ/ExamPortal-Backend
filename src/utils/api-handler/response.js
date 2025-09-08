export class ApiResponse {
  constructor(message, data) {
    this.status = "SUCCESS";
    this.responseMsg = message;
    this.payload = data;
  }
}
