import { DOMParser } from "@xmldom/xmldom";
import axios from "axios";
import { Client } from "minio";
import sharp from "sharp";

import { getPagesBaseUrl } from "./scraper";
import { pad, progress, msg } from "./util";

const BUCKET_NAME = process.env.STORAGE_BUCKET!;
const minioClient = new Client({
  accessKey: process.env.STORAGE_ACCESS_KEY!,
  secretKey: process.env.STORAGE_SECRET_KEY!,
  endPoint: process.env.STORAGE_ENDPOINT!,
  // port: 9000,
  // useSSL: false,
});

interface processingCallback {
  (pageId: string, wordId: string, subImage: Buffer): Promise<void>;
}

const splitter = async (
  pageId: string,
  imgUrl: string,
  xmlUrl: string,
  callback: processingCallback,
  msgPfx = "",
) => {
  msg(`${msgPfx}fetching image file...`);
  const imgBuffer: Buffer = (
    await axios({ url: imgUrl, responseType: "arraybuffer" })
  ).data;

  msg(`${msgPfx}reading image file...`);
  const img = sharp(imgBuffer);

  msg(`${msgPfx}fetching metadata file...`);
  const xmlBuffer: Buffer = (
    await axios({ url: xmlUrl, responseType: "arraybuffer" })
  ).data;

  msg(`${msgPfx}parsing metadata file...`);
  const xml = new DOMParser().parseFromString(xmlBuffer.toString("utf-8"));
  const nodes = xml.getElementsByTagName("String");

  for await (const [index, node] of Array.from(nodes).entries()) {
    const wordId = pad(index, nodes.length);

    msg(`${msgPfx}${wordId}/${nodes.length} parsing word...`);
    // NOTE: we use non-null assertions because we trust the XML to be valid
    const left = parseInt(node.attributes.getNamedItem("HPOS")!.value);
    const top = parseInt(node.attributes.getNamedItem("VPOS")!.value);
    const width = parseInt(node.attributes.getNamedItem("WIDTH")!.value);
    const height = parseInt(node.attributes.getNamedItem("HEIGHT")!.value);

    msg(`${msgPfx}${wordId}/${nodes.length} cropping word...`);
    const region: sharp.Region = { left, top, width, height };
    const subImage = await img.extract(region).toBuffer();

    msg(`${msgPfx}${wordId}/${nodes.length} storing word...`);
    await callback(pageId, wordId, subImage);
  }
  msg(`${msgPfx}Successfully extracted ${nodes.length} words.`, true);
};

async function osSeeder() {
  const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
  if (!bucketExists) throw new Error(`Bucket '${BUCKET_NAME}' does not exist.`);

  const pagesBaseUrl = await getPagesBaseUrl();

  const filter = process.env.PAGE_FILTER
    ? new RegExp(process.env.PAGE_FILTER)
    : /^ARBEI_19190109_\d+$/;
  const filteredPageIds = Object.keys(pagesBaseUrl).filter((id) =>
    filter.test(id),
  );
  msg(`Isolated ${filteredPageIds.length} pages with filter ${filter}`, true);

  const cb: processingCallback = async (pageId, wordId, subImage) => {
    const objectName = `${pageId}/${wordId}.png`;
    await minioClient.putObject(BUCKET_NAME, objectName, subImage);
  };

  for await (const [index, pageId] of filteredPageIds.entries()) {
    const pngUrl = pagesBaseUrl[pageId] + ".png";
    const xmlUrl = pagesBaseUrl[pageId] + ".alto.xml";
    const msgPfx = `${progress(index + 1, filteredPageIds)} ${pageId} | `;
    await splitter(pageId, pngUrl, xmlUrl, cb, msgPfx);
  }
}

osSeeder();
