import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

// Backblaze B2 ko S3-compatible API se use kar rahe hain.
// Bucket PRIVATE rakho — image sirf signed (temporary) URL se khulti hai.

let client: S3Client | null = null;

const getBucket = () => {
  const bucket = process.env.B2_BUCKET;
  if (!bucket) throw new Error("B2_BUCKET env var not set");
  return bucket;
};

const getClient = () => {
  if (client) return client;

  const endpoint = process.env.B2_ENDPOINT; // e.g. https://s3.us-west-004.backblazeb2.com
  const accessKeyId = process.env.B2_KEY_ID;
  const secretAccessKey = process.env.B2_APP_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("Backblaze B2 env vars missing (B2_ENDPOINT, B2_KEY_ID, B2_APP_KEY)");
  }

  const region =
    process.env.B2_REGION ||
    endpoint.match(/s3\.([^.]+)\.backblazeb2\.com/)?.[1] ||
    "us-west-004";

  client = new S3Client({
    region,
    endpoint,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
    // B2 newer AWS SDK ke default CRC32 checksum headers ke saath dikkat deta hai
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  return client;
};

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
};

/** Sirf apne banaye hue keys allow karo (client se aaya key trust nahi karte) */
export const isValidBillImageKey = (key: unknown): key is string =>
  typeof key === "string" &&
  /^bills\/\d{4}\/\d{2}\/[a-f0-9-]{36}\.[a-z0-9]{2,5}$/.test(key);

export const uploadBillImage = async (buffer: Buffer, mimeType: string): Promise<string> => {
  const now = new Date();
  const ext = EXT_BY_MIME[mimeType] || "jpg";
  const key = `bills/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${randomUUID()}.${ext}`;

  await getClient().send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );
  return key;
};

/** Temporary view link (default 10 min) */
export const getBillImageUrl = (key: string, expiresInSeconds = 600) =>
  getSignedUrl(
    getClient(),
    new GetObjectCommand({ Bucket: getBucket(), Key: key }),
    { expiresIn: expiresInSeconds }
  );

/** Best-effort delete — fail ho toh bill ka kaam na ruke */
export const deleteBillImage = async (key?: string | null) => {
  if (!isValidBillImageKey(key)) return;
  try {
    await getClient().send(new DeleteObjectCommand({ Bucket: getBucket(), Key: key }));
  } catch (err) {
    console.error("B2 delete failed:", key, err);
  }
};
