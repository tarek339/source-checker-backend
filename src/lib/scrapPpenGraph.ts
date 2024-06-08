import ogs from "open-graph-scraper";
import { OgObject } from "open-graph-scraper/dist/lib/types";

export const scrapOpenGraph = async (
  // firstURL: string,
  // secondURL: string,
  // secondURLArr: any[]
  url: string,
  firstURLArr: OgObject
) => {
  try {
    // const firstRes = await fetch(firstURL);
    // const firstData = await firstRes.json();
    // firstURLArr.push(firstData);
    // const secondRes = await fetch(secondURL);
    // const secondData = await secondRes.json();
    // secondURLArr.push(secondData);

    const options = { url: url };
    const data = await ogs(options);
    const { result } = data;
    firstURLArr = result;
  } catch (error) {
    console.log(error);
  }
};
