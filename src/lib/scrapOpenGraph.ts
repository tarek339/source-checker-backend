import ogs from "open-graph-scraper";

export const scrapOpenGraph = async (
  // firstURL: string,
  // secondURL: string,
  // secondURLArr: any[]
  url: string
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
    return result;
  } catch (error) {
    console.log(error);
  }
};
