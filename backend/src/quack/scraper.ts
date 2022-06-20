import { DOMParser } from "@xmldom/xmldom";
import axios from "axios";

import { msg, progress } from "./util";

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

const BASE_URL = `https://all4ling.eurac.edu/quack`;

export async function getPagesBaseUrl() {
  msg(`Fetching coordinates of all pages available at ${BASE_URL} ...`, true);

  const result: { [key: string]: string } = {};

  const url = `${BASE_URL}/`;
  const years = getLinks(await getPage(url), "subfolders");
  for (const [i, year] of years.entries()) {
    const url = `${BASE_URL}/${year}/`;
    const issues = getLinks(await getPage(url), "subfolders");
    for (const [j, issue] of issues.entries()) {
      const url = `${BASE_URL}/${year}/${issue}/`;
      const pages = getLinks(await getPage(url), "imagelinks");
      for (const [k, page] of pages.entries()) {
        msg(
          [
            `${year} (${progress(i, years)})`,
            `${issue} (${progress(j, issues)})`,
            `${page} (${progress(k, pages)})`,
          ].join(" -> "),
        );
        result[page as string] = `${BASE_URL}/${year}/${issue}/${page}`;
      }
    }
  }
  msg(`Fetched coordinates for ${Object.keys(result).length} pages.`, true);
  return result;
}

// getPagesBaseUrl();
