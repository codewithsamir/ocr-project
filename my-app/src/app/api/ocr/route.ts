import { createWorker } from "tesseract.js";
import formidablePkg from "formidable";
import fs from "fs";

const { IncomingForm } = formidablePkg;

export const config = { api: { bodyParser: false } };

export async function POST(req: Request) {
  try {
    const buffer = Buffer.from(await req.arrayBuffer());
    const tmpFilePath = "./temp_upload.png";
    fs.writeFileSync(tmpFilePath, buffer);

    const form = new IncomingForm({ multiples: false });
    const parsed = await new Promise<{ files: formidablePkg.Files }>((resolve, reject) => {
      form.parse({ file: tmpFilePath } as any, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ files });
      });
    });

    const file = parsed.files.file as formidablePkg.File;
    if (!file) return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });

    const worker: any = await createWorker({
      langPath: "./tessdata",
      logger: console.log,
    });

    await worker.loadLanguage("eng+nep+equ");
    await worker.reinitialize("eng+nep+equ");
    await worker.setParameters({ tessedit_pageseg_mode: 6 });

    const { data: { text } } = await worker.recognize(fs.readFileSync(file.filepath));
    await worker.terminate();

    return new Response(JSON.stringify({ text }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "OCR failed" }), { status: 500 });
  }
}
