// @ts-ignore
const base_url = import.meta.env.DEV ? "http://localhost:3000" : "https://b.oui.moe";
export default {
	base_url,
	title: "b.oui.moe",
	author: "Yulxon",
	taxonomies: [
		{
			feed: true,
			name: "tags",
		},
		{
			feed: true,
			name: "categories",
		},
	],
	description: "Yulxon's blog. Place to place myself",
	license: "CC BY-SA 4.0",
	menu: [
		{
			name: "我?",
			url: "/me",
		},
		{
			name: "分类",
			url: "/taxonomy",
		},
		{
			name: "搜寻",
			url: "/search",
		},
		{
			name: "首頁",
			url: "/",
		},
	],
	about: {
		tags: [
			"操作系统爱好者",
			"NixOS 用户",
			"抽象思维",
			"待定",
		],
		lorem: ["循此苦旅 以达星辰", "你好，世界"]
	}
};
