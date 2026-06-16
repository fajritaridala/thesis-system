import crypto from "crypto";
import stableStringify from "json-stable-stringify";

function generateHash<T extends Record<string, any>>(input: T) {
  const data = stableStringify(input);
  if (!data)
    throw new Error("Gagal generate hash: Input tidak valid atau kosong");
  return crypto.createHash("sha256").update(data).digest("hex");
}

export default generateHash;
