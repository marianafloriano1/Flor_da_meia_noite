import { createDecipheriv } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const [input, output] = process.argv.slice(2);
const keyHex = process.env.TASK015_IMAGE_KEY;
if (!input || !output || !/^[a-f0-9]{64}$/i.test(keyHex ?? "")) {
  console.error(
    "usage: TASK015_IMAGE_KEY=<secret> node decrypt-private-images.mjs <encrypted> <output-zip>",
  );
  process.exit(2);
}
const data = await readFile(input);
const magic = Buffer.from("TASK015IMG1\n");
const headerLength = magic.length + 12 + 16;
if (data.length <= headerLength || !data.subarray(0, magic.length).equals(magic)) {
  throw new Error("task015_encrypted_asset_package_invalid");
}
const iv = data.subarray(magic.length, magic.length + 12);
const tag = data.subarray(magic.length + 12, headerLength);
const decipher = createDecipheriv("aes-256-gcm", Buffer.from(keyHex, "hex"), iv);
decipher.setAuthTag(tag);
const plaintext = Buffer.concat([decipher.update(data.subarray(headerLength)), decipher.final()]);
await writeFile(output, plaintext, { mode: 0o600, flag: "wx" });
console.log("TASK015 private image package decrypted to the runner temporary directory.");
