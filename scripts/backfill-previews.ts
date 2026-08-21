import 'dotenv/config';
import { db as prisma } from '../src/lib/db';
import { uploadWebsitePreview } from '../src/lib/cloudinary';

async function main() {
  const dealsWithLinks = await prisma.deal.findMany({
    where: { link: { not: null } },
  });

  console.log(`Found ${dealsWithLinks.length} deals with links.`);

  for (const deal of dealsWithLinks) {
    if (deal.link) {
      console.log(`Uploading preview for ${deal.projectName} (${deal.link})...`);
      const previewUrl = await uploadWebsitePreview(deal.link, deal.id);
      if (previewUrl) {
        await prisma.deal.update({
          where: { id: deal.id },
          data: { previewImage: previewUrl },
        });
        console.log(`✓ Saved Cloudinary preview: ${previewUrl}`);
      } else {
        console.log(`✗ Failed to upload preview for ${deal.projectName}`);
      }
    }
  }

  console.log("Backfill complete.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
