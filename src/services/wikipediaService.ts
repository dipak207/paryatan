import axios from "axios";

const WIKI_API = process.env.WIKIPEDIA_API_URL || "https://en.wikipedia.org/w/api.php";

export async function fetchWikipediaImage(pageTitle: string) {
  const resp = await axios.get(WIKI_API, {
    params: {
      action: "query",
      prop: "pageimages|extracts",
      exintro: true,
      format: "json",
      piprop: "original",
      titles: pageTitle,
    },
  });
  const pages = resp.data.query?.pages;
  const page = pages && Object.values(pages)[0] as { original?: { source?: string } };
  return page?.original?.source || null;
}
