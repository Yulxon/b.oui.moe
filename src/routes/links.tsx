import type { Component } from "solid-js";
import { For } from "solid-js";
import cfg from "~/constant";
import { Link, Meta, Title } from "@solidjs/meta";

// 友链列表：在这里添加你的朋友们 (name / url / desc)
const friends = [
	{
		name: "博客联盟",
		url: "https://bo.ke/",
		desc: "",
	},
];

const Links: Component = () => {
	const currentUrl = cfg.base_url + "/links";

	return (<>
		<Title>友链 - {cfg.title}</Title>
		<Link rel="canonical" href={currentUrl} />
		<Meta property="og:url" content={currentUrl} />
		<Meta property="og:title" content={`友链 - ${cfg.title}`} />
		<Meta property="og:description" content={"朋友们的博客"} />
		<Meta name="description" content={"朋友们的博客"} />
		<Meta name="twitter:card" content="summary" />
		<Meta name="twitter:title" content={`友链 - ${cfg.title}`} />
		<Meta name="twitter:description" content={"朋友们的博客"} />
		<Meta name="author" content={cfg.author} />
		<div class="flex flex-col space-y-6 px-3 sm:px-0 w-full sm:w-2/3 2xl:w-7/12 mx-auto my-6 md:mt-14 grow">
			<h1 class="text-2xl font-sans font-bold text-stone-700 dark:text-stone-300 mx-auto">友链</h1>
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full md:w-3/4 mx-auto">
				<For each={friends}>
					{(friend) => (
						<a
							href={friend.url}
							target="_blank"
							rel="noopener noreferrer"
							class="group relative not-prose block rounded-2xl no-underline
								bg-gradient-to-br from-[#f1f1f1] to-[#fbfbfb]
								dark:from-[#252525] dark:to-[#1e1e1e]
								shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)]
								border border-gray-200/50 dark:border-gray-700/50
								ring-1 ring-white/80 dark:ring-white/5
								transition-all duration-500
								hover:scale-[1.03] hover:-translate-y-1
								hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12)]
								p-5"
						>
							<div class="font-sans font-semibold text-stone-700 dark:text-stone-300 text-base
								bg-gradient-to-br from-sprout-500 to-sprout-700 bg-clip-text
								group-hover:text-transparent transition-colors duration-300">
								{friend.name}
							</div>
							{friend.desc && (
								<div class="mt-1.5 text-sm text-stone-400 dark:text-stone-500 font-sans leading-snug">
									{friend.desc}
								</div>
							)}
							<div class="mt-2 text-xs text-stone-400/70 dark:text-stone-600 font-mono truncate">
								{friend.url}
							</div>
						</a>
					)}
				</For>
			</div>
		</div>
	</>);
};

export default Links;
