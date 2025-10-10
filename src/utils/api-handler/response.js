import { removeNullsDeep } from "#utils/utils.js";

export class ApiResponse {
  constructor(message, data) {
    this.status = "SUCCESS";
    this.responseCode = message || "SUCCESS";
    this.payload =
      data && typeof data === "object" ? removeNullsDeep(data) : data;
  }
}
