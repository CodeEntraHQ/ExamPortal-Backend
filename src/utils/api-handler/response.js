class ApiResponse {
  constructor(code, message, data) {
    if (code === 200) {
      this.status = "SUCCESS";
      this.responseMsg = message;
      this.payload = data;
    } else {
      this.status = "FAILURE";
      this.responseMsg = message;
    }
  }
}

export { ApiResponse };
