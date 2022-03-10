import axios from "axios";
import { Knex } from "knex";
import { DOMParser } from "@xmldom/xmldom";
import sharp from "sharp";

interface processingCallback {
  (
    pageId: string,
    wordId: number,
    transcript: string,
    confidence: number,
    imgDataURL: string,
  ): Promise<void>;
}

const splitter = async (
  pageId: string,
  imgUrl: string,
  xmlUrl: string,
  callback: processingCallback,
) => {
  console.log(`IMG: ${imgUrl}`);

  console.log(`IMG: fetching...`);
  const imgBuffer: Buffer = (
    await axios({ url: imgUrl, responseType: "arraybuffer" })
  ).data;

  console.log(`IMG: parsing...`);
  const img = sharp(imgBuffer);

  console.log(`XML: ${xmlUrl}`);

  console.log(`XML: fetching...`);
  const xmlBuffer: Buffer = (
    await axios({ url: xmlUrl, responseType: "arraybuffer" })
  ).data;

  console.log(`XML: parsing...`);
  const xml = new DOMParser().parseFromString(xmlBuffer.toString("utf-8"));

  const nodes = xml.getElementsByTagName("String");
  console.log(`${nodes.length} String nodes found. Importing...`);
  for await (const [index, node] of Array.from(nodes).entries()) {
    // NOTE: we use non-null assertions because we trust the XML to be valid
    const transcript = node.attributes.getNamedItem("CONTENT")!.value;
    const confidence = parseFloat(node.attributes.getNamedItem("WC")!.value);
    const region: sharp.Region = {
      left: parseInt(node.attributes.getNamedItem("HPOS")!.value),
      top: parseInt(node.attributes.getNamedItem("VPOS")!.value),
      width: parseInt(node.attributes.getNamedItem("WIDTH")!.value),
      height: parseInt(node.attributes.getNamedItem("HEIGHT")!.value),
    };
    const subImage = await img.extract(region).toBuffer();
    const imgDataURL = `data:image/png;base64,${subImage.toString("base64")}`;
    await callback(pageId, index, transcript, confidence, imgDataURL);
  }
};

export const seed = async (knex: Knex): Promise<void> => {
  //await knex("words").del();
  await splitter(
    "ARBEI_19190109_001",
    "https://all4ling.eurac.edu/quack/1919/19190109/ARBEI_19190109_001.png",
    "https://all4ling.eurac.edu/quack/1919/19190109/ARBEI_19190109_001.alto.xml",
    async (pageId, wordId, transcript, confidence, imgDataURL) => {
      console.log("Saving to db", pageId, "/", wordId);
      await knex("words")
        .insert({
          page_id: pageId,
          word_id: wordId,
          ocr_transcript: transcript,
          ocr_confidence: confidence,
          image: imgDataURL,
        })
        .onConflict()
        .ignore();
      // TODO: maybe update on conflict? https://dev.to/vvo/upserts-in-knex-js-1h4o
    },
  );
};
