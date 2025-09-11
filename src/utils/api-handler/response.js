export class ApiResponse {
  constructor(message, data) {
    this.status = "SUCCESS";
    this.responseCode = message;
    this.payload = data;
  }
}
