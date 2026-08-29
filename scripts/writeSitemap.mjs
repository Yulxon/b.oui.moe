import fs from "fs/promises";

const baseURL = "https://b.oui.moe";

const readData = async () => {
	const module = await import("../.content-collections/generated/allPosts.js");
	return module.default;
};

const staticPages = [
	{ loc: baseURL, changefreq: "weekly" },
	{ loc: `${baseURL}/taxonomy`, changefreq: "weekly" },
	{ loc: `${baseURL}/search`, changefreq: "monthly" },
	{ loc: `${baseURL}/me`, changefreq: "monthly" },
	{ loc: `${baseURL}/links`, changefreq: "monthly" },
];

const formatDate = (date) => {
	const d = new Date(date);
	return d.toISOString().split("T")[0];
};

const generateSitemap = (data) => {
	const postEntries = data
		.filter((item) => !item.draft)
		.map((item) =>
			`  <url>\n    <loc>${baseURL}/${item._meta.path}</loc>\n    <lastmod>${formatDate(item.date)}</lastmod>\n  </url>`
		);

	const staticEntries = staticPages.map((page) =>
		`  <url>\n    <loc>${page.loc}</loc>\n    <changefreq>${page.changefreq}</changefreq>\n  </url>`
	);

	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...staticEntries, ...postEntries].join("\n")}\n</urlset>`;
};

const generateAndSaveSitemap = async () => {
	try {
		const data = await readData();
		const sitemap = generateSitemap(data);
		await fs.writeFile("public/sitemap.xml", sitemap);
		console.log("Sitemap generated and saved as sitemap.xml");
	} catch (error) {
		console.error("Error generating sitemap:", error);
	}
};

generateAndSaveSitemap();
