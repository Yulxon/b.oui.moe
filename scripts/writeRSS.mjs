// scripts/writeRSS.mjs
import fs from "fs/promises";
import { Feed } from "feed";

const baseURL = "https://b.oui.moe";
const title = "b.oui.moe";
const author = "Yulxon";
const description = "Yulxon's blog. Place to place myself";

const readData = async () => {
	const module = await import("../.content-collections/generated/allPosts.js");
	return module.default;
};

const generateRss = (data) => {
    const feed = new Feed({
        title,
        description,
        id: baseURL,
        link: baseURL,
        language: "zh-CN",
        favicon: `${baseURL}/favicon.svg`,
        copyright: `CC BY-SA 4.0 ${new Date().getFullYear()}, ${author}`,
        author: {
            name: author,
        }
    });

    data
        .filter((item) => !item.draft)
        .forEach((item) => {
            feed.addItem({
                title: item.title,
                id: `${baseURL}/${item._meta.path}`,
                link: `${baseURL}/${item._meta.path}`,
                description: item.description,
                date: new Date(item.date),
            });
        });

    return feed.rss2();
};

const generateAndSaveRss = async () => {
	try {
		const data = await readData();
		const rss = generateRss(data);
		await fs.writeFile("public/rss.xml", rss);
		console.log("RSS feed generated and saved as rss.xml");
	} catch (error) {
		console.error("Error generating RSS feed:", error);
	}
};

generateAndSaveRss();
