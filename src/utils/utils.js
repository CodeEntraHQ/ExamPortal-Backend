import { Buffer } from "buffer";
import { v4 as uuidv4 } from "uuid";

export const generateUUID = () => {
  return uuidv4();
};

export const encodeBase64 = (data) => {
  return Buffer.from(data, "utf-8").toString("base64");
};
