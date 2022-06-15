import axios from "axios";
import { Knex } from "knex";
import { DOMParser } from "@xmldom/xmldom";
import sharp from "sharp";
import { type } from "os";
import { getPackedSettings } from "http2";

async function getPage(url: string): Promise<Document> {
  const response = await axios({ url: url, responseType: "arraybuffer" });
  const dataBuffer: Buffer = response.data;
  return new DOMParser().parseFromString(dataBuffer.toString("utf-8"));
}

function getLinks(xml: Document, tableClass: string) {
  const tableElement = xml.getElementsByClassName(tableClass)[0];
  return Array.from(tableElement.getElementsByTagName("a")).map(
    (a) => a.textContent,
  );
}

async function dostuff() {
  process.stdout.write("Fetching coordinates of all available issues...\n");

  const url = `https://all4ling.eurac.edu/quack`;
  const pageUrls: string[] = [];

  const years = getLinks(await getPage(`${url}/`), "subfolders");
  for (const [i, year] of years.entries()) {
    const issues = getLinks(await getPage(`${url}/${year}/`), "subfolders");
    for (const [j, issue] of issues.entries()) {
      const pages = getLinks(
        await getPage(`${url}/${year}/${issue}/`),
        "imagelinks",
      );
      for (const [k, page] of pages.entries()) {
        process.stdout.write(
          `${year} (${i}/${years.length})` +
            ` -> ${issue} (${j}/${issues.length})` +
            ` -> ${page} (${k}/${pages.length})` +
            "                                        \r",
        );
        pageUrls.push(`${url}/${year}/${issue}/${page}`);
      }
    }
  }
  process.stdout.write("\n");
  process.stdout.write(`Gathered ${pageUrls.length} page urls.\n`);
}

dostuff();
