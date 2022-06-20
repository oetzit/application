import { DOMParser } from "@xmldom/xmldom";
import axios from "axios";
import { Knex } from "knex";
import { getPagesBaseUrl } from "./scraper";
import { msg, progress } from "./util";

interface processingCallback {
  (
    pageId: string,
    wordId: number,
    transcript: string,
    confidence: number,
  ): Promise<void>;
}

const splitter = async (
  pageId: string,
  xmlUrl: string,
  callback: processingCallback,
  msgPfx = "",
) => {
  msg(`${msgPfx}fetching metadata file...`);
  const xmlBuffer: Buffer = (
    await axios({ url: xmlUrl, responseType: "arraybuffer" })
  ).data;

  msg(`${msgPfx}parsing metadata file...`);
  const xml = new DOMParser().parseFromString(xmlBuffer.toString("utf-8"));
  const nodes = xml.getElementsByTagName("String");

  for await (const [index, node] of Array.from(nodes).entries()) {
    const prog = progress(index + 1, nodes.length);

    msg(`${msgPfx}${prog} parsing word...`);
    // NOTE: we use non-null assertions because we trust the XML to be valid
    const transcript = node.attributes.getNamedItem("CONTENT")!.value;
    const confidence = parseFloat(node.attributes.getNamedItem("WC")!.value);

    msg(`${msgPfx}${prog} storing word...`);
    await callback(pageId, index, transcript, confidence);
  }
  msg(`${msgPfx}Successfully extracted ${nodes.length} words.`, true);
};

export const dbSeeder = async (knex: Knex): Promise<void> => {
  const pagesBaseUrl = await getPagesBaseUrl();

  const filter = process.env.PAGE_FILTER
    ? new RegExp(process.env.PAGE_FILTER)
    : /^ARBEI_19190109_\d+$/;
  const filteredPageIds = Object.keys(pagesBaseUrl).filter((id) =>
    filter.test(id),
  );
  msg(`Isolated ${filteredPageIds.length} pages with filter ${filter}`, true);

  const cb: processingCallback = async (
    pageId,
    wordId,
    transcript,
    confidence,
  ) => {
    const record = {
      page_id: pageId,
      word_id: wordId,
      ocr_transcript: transcript,
      ocr_confidence: confidence,
    };
    // TODO: maybe update on conflict? https://dev.to/vvo/upserts-in-knex-js-1h4o
    await knex("words").insert(record).onConflict().ignore();
  };

  for await (const [index, pageId] of filteredPageIds.entries()) {
    const xmlUrl = pagesBaseUrl[pageId] + ".alto.xml";
    const msgPfx = `${progress(index + 1, filteredPageIds)} ${pageId} | `;
    await splitter(pageId, xmlUrl, cb, msgPfx);
  }
};
