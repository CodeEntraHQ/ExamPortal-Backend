import { Buffer } from "buffer";
import { v4 as uuidv4 } from "uuid";

export const generateUUID = () => {
  return uuidv4();
};

export const encodeBase64 = (data) => {
  return Buffer.from(data, "utf-8").toString("base64");
};

export const constructMediaLink = (media_id) => {
  if (media_id) {
    return process.env.MEDIA_BASE_URL + media_id;
  }
  return null;
};

export const removeNullsDeep = (value) => {
  if (value === null || value === undefined) return undefined;

  if (typeof value !== "object") return value;

  if (
    value instanceof Date ||
    value instanceof RegExp ||
    value instanceof Map ||
    value instanceof Set ||
    (typeof Buffer !== "undefined" && Buffer.isBuffer(value))
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    const cleanedArray = value
      .map(removeNullsDeep)
      .filter((v) => v !== undefined && v !== null);
    return cleanedArray.length ? cleanedArray : [];
  }

  if (Object.prototype.toString.call(value) === "[object Object]") {
    const entries = Object.entries(value)
      .filter(([_, v]) => v !== null && v !== undefined)
      .map(([k, v]) => [k, removeNullsDeep(v)]);
    return Object.fromEntries(entries);
  }

  return value;
};
