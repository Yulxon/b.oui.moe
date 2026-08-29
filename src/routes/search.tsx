import { type Component, createEffect, createSignal, For, Show } from "solid-js";
import cfg from "~/constant";
import { A } from "@solidjs/router";
import { twMerge } from "tailwind-merge";
import { Link, Meta, Title } from "@solidjs/meta";
import { allPosts } from "content-collections";

type Hit = {
	title: string;
	date: string;
	path: string;
	description: string;
};

const Search: Component = () => {
	const [focus, setFocus] = createSignal(false);
	const [inp, setInp] = createSignal<string>();
	const [res, setRes] = createSignal<Hit[] | undefined>(undefined);

	createEffect(() => {
		const query = (inp() ?? "").trim().toLowerCase();
		if (!query) {
			setRes(undefined);
			return;
		}
		if (query.length < 2) {
			setRes([]);
			return;
		}
		const hits: Hit[] = (allPosts || [])
			.filter((p: any) => !p.draft)
			.map((p: any) => ({
				title: p.title,
				date: p.date.toISOString ? p.date.toISOString() : p.date,
				path: p._meta.path,
				description: p.description || "",
			}))
			.filter((p) =>
				[p.title, p.description, p.path]
					.join(" ")
					.toLowerCase()
					.includes(query),
			)
			.toSorted((a, b) => (a.date < b.date ? 1 : -1));
		setRes(hits);
	});

	const currentUrl = cfg.base_url + "/search";

	return (<>
		<Title>搜索 - {cfg.title}</Title>
		<Link rel="canonical" href={currentUrl} />
		<Meta property="og:url" content={currentUrl} />
		<Meta property="og:title" content={`搜索 - ${cfg.title}`} />
		<Meta
			property="og:description"
			content={"搜索 " + cfg.base_url + " 上的文章"}
		/>
		<Meta
			name="description"
			content={"搜索 " + cfg.base_url + " 上的文章"}
		/>
		<Meta name="twitter:card" content="summary" />
		<Meta name="twitter:title" content={`搜索 - ${cfg.title}`} />
		<Meta name="twitter:description" content={"搜索 " + cfg.base_url + " 上的文章"} />
		<Meta name="author" content={cfg.author} />
		<div class="flex flex-col space-y-10 2xl:space-y-12 px-3 sm:px-0 w-full sm:w-2/3 2xl:w-7/12 mx-auto my-6 md:mt-14 grow ">
			<input
				class={twMerge("mx-auto w-11/12 md:w-1/2 md:mb-4 h-10 ring ring-2 focus:ring-offset-2 transition-all rounded-md shadow-lg focus:outline-none px-3",
					focus() ? " mt-8 md:mt-0" : "mt-30 md:mt-0",
					"ring-sprout-200")}
				onInput={(e) =>
					setInp(e.target.value)
				}
				onFocusIn={() => setFocus(true)}
				onFocusOut={() => setFocus(false)}
				placeholder={"搜索文章…"}
			></input>

			<div class="min-h-3/4 grow w-full md:w-3/4 mx-auto">
				<Show when={res() && res()!.length === 0}>
					<div class="text-center text-ink-mute font-mono py-10" style={{ "font-size": "12px" }}>
						no results
					</div>
				</Show>
				<For each={res()}>
					{(attr) => {
						return (
							<div class="antialiased flex flex-col mx-3 md:mx-8 2xl:mx-12">
								<article class="flex overflow-x-hidden overflow-y-visible text-slate-700 flex-1 items-center space-x-3 md:space-x-5 text-sm 2xl:text-lg">
									<div class="no-underline font-light leading-snug text-slate-600 min-w-12 font-mono">
										{new Date(attr.date).toLocaleDateString("en-US", {
											year: "numeric",
											month: "2-digit",
											day: "2-digit",
										})
											.toString()}
									</div>
									<A
										href={`/${attr.path}`}
										class={twMerge(
											"no-underline font-sans text-[#333333] dark:text-chill-200 truncate group transition-all duration-300 ease-in-out leading-loose",
										)}
									>
										{attr.title}
										<span class="block max-w-0 group-hover:max-w-full transition-all duration-350 h-px bg-sprout-500" />
									</A>
								</article>
							</div>)
					}}
				</For>
			</div>
		</div>
	</>)
}


export default Search;
