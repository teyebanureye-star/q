import path from "path";
import fs from "fs";

export default function handler(_req: any, res: any) {
  const zipPath = path.join(process.cwd(), "public", "fana-voice-studio.zip");

  if (!fs.existsSync(zipPath)) {
    return res.status(404).send("ZIP file not found");
  }

  const stat = fs.statSync(zipPath);
  res.writeHead(200, {
    "Content-Type": "application/zip",
    "Content-Length": stat.size,
    "Content-Disposition": 'attachment; filename="fana-voice-studio.zip"',
  });

  const readStream = fs.createReadStream(zipPath);
  readStream.pipe(res);
}
