import ogs from "open-graph-scraper";

export const scrapOpenGraph = async (url: string) => {
  try {
    const options = { url: url };
    const data = await ogs(options);
    const { result } = data;
    return result;
  } catch (error) {
    console.error(`Error scraping open graph data ${(error as Error).message}`);
  }
};
