import { randomBytes } from "crypto";

export function generateState(length = 24) {
  return randomBytes(length).toString("hex");
}
