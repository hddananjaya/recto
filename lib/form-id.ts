import { randomInt } from "crypto";

const FORM_ID_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const FORM_ID_LENGTH = 6;

export function generateFormId(): string {
  let id = "";
  for (let i = 0; i < FORM_ID_LENGTH; i++) {
    id += FORM_ID_ALPHABET[randomInt(FORM_ID_ALPHABET.length)];
  }
  return id;
}

export function publicFormPath(formId: string): string {
  return `/f/${formId}`;
}

export function publicFormUrl(formId: string, origin: string): string {
  return `${origin}${publicFormPath(formId)}`;
}
