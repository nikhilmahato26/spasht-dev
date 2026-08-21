import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

function normalizeUrl(rawUrl?: string | null): string {
  if (!rawUrl) return "";
  const trimmed = rawUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Captures a website screenshot and uploads a lightweight WebP (~25-35 KB)
 * to Cloudinary so that storage is not filled up with heavy HD screenshots.
 */
export async function uploadWebsitePreview(
  rawUrl: string,
  dealId: string
): Promise<string | null> {
  const normalizedUrl = normalizeUrl(rawUrl);
  if (!normalizedUrl) return null;

  if (!isCloudinaryConfigured()) {
    console.warn(
      "[Cloudinary] CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET is missing. Skipping Cloudinary upload."
    );
    return null;
  }

  try {
    // Fetch a standard 1024x640 screenshot via Microlink
    const screenshotSourceUrl = `https://api.microlink.io/?url=${encodeURIComponent(
      normalizedUrl
    )}&screenshot=true&meta=false&embed=screenshot.url&viewport.width=1024&viewport.height=640&viewport.deviceScaleFactor=1`;

    const result = await cloudinary.uploader.upload(screenshotSourceUrl, {
      folder: "spasht/portfolio-previews",
      public_id: `deal_${dealId}`,
      overwrite: true,
      invalidate: true,
      resource_type: "image",
      transformation: [
        {
          width: 800,
          height: 500,
          crop: "limit",
          quality: "auto:eco", // Eco compression (~25-35KB file size)
          fetch_format: "webp",
        },
      ],
    });

    return result.secure_url || result.url || null;
  } catch (error) {
    console.error("[Cloudinary] Failed to upload preview screenshot:", error);
    return null;
  }
}

/**
 * Deletes a deal's preview image from Cloudinary when the link is cleared.
 */
export async function deleteWebsitePreview(dealId: string): Promise<void> {
  if (!isCloudinaryConfigured()) return;

  try {
    await cloudinary.uploader.destroy(`spasht/portfolio-previews/deal_${dealId}`, {
      invalidate: true,
    });
  } catch (error) {
    console.error("[Cloudinary] Failed to delete preview:", error);
  }
}
