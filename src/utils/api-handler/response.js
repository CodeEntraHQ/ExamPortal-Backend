export class ApiResponse {
  constructor(message, data) {
    this.status = "SUCCESS";
    this.responseCode = message || "SUCCESS";
    this.payload =
      data && typeof data === "object"
        ? Object.fromEntries(
            Object.entries(data).filter(([_, v]) => v !== null)
          )
        : data;
  }
}
