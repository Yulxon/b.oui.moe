import Reveal from "~/ingredients/RandReveal";
import cfg from "~/constant";
import { QuickLinks, type QuickLinksProps } from "~/ingredients/QuickLink";
import { Link, Meta, MetaProvider, Title } from "@solidjs/meta";
import { createSignal, For } from "solid-js";

export default function Me() {
	const shuffle = (a: any[]) =>
		a
			.map((value) => ({ value, sort: Math.random() }))
			.toSorted((a, b) => a.sort - b.sort)
			.map(({ value }) => value);

	const [descIdx, setDescIdx] = createSignal(0);
	const randDesc = shuffle(cfg.about.tags);

	const delayIncreaseIdx = () =>
		setTimeout(() => {
			setDescIdx((prev) => (prev + 1) % randDesc.length);
		}, 50);
	const [activeLinkIndex, setActiveLinkIndex] = createSignal<number | null>(null);

	let leaveTimer: ReturnType<typeof setTimeout>;

	const handleMouseEnter = (index: number) => {
		clearTimeout(leaveTimer);
		setActiveLinkIndex(index);
	};

	const handleMouseLeave = () => {
		leaveTimer = setTimeout(() => {
			setActiveLinkIndex(null);
		}, 300);
	};

	const [qlProps, _setqlProps] = createSignal<
		[QuickLinksProps,
			QuickLinksProps,
			QuickLinksProps,
			QuickLinksProps,
			QuickLinksProps,
			QuickLinksProps]>([
				{
					title: "GitHub",
					href: "https://github.com/Yulxon",
					icon: () => (
						<div class="pointer-events-none i-material-symbols:grid-3x3-rounded w-8 h-8 text-sprout-500" />
					),
				},
				{
					title: "Mailbox",
					href: "mailto:yulxon@oui.moe",
					icon: () => (
						<div class="pointer-events-none i-material-symbols:alternate-email w-8 h-8 text-sprout-500" />
					),
				},
				{
					title: "RSS",
					href: "/rss.xml",
					icon: () => (
						<div class="pointer-events-none i-material-symbols:rss-feed w-8 h-8 text-sprout-500" />
					),
				},
				{
					title: "Archive",
					href: "/taxonomy",
					icon: () => (
						<div class="pointer-events-none i-material-symbols:center-focus-strong-outline w-8 h-8 text-sprout-500" />
					),
				},
				{
					title: "Search",
					href: "/search",
					icon: () => (
						<div class="pointer-events-none i-material-symbols:key-outline w-8 h-8 text-sprout-500" />
					),
				},
				{
					title: "Home",
					href: "/",
					icon: () => (
						<div class="pointer-events-none i-material-symbols:home-outline w-8 h-8 text-sprout-500" />
					),
				},
			]);

	return (
		<>
			<MetaProvider>
				<Link rel="canonical" href={cfg.base_url + "/me"} />
				<Meta name="twitter:card" content="summary" />
				<Meta name="description" content={`About ${cfg.author}`} />
				<Meta name="author" content={cfg.author} />
				<Meta property="og:url" content={cfg.base_url} />
				<Meta property="og:site_name" content={cfg.title} />
				<Meta property="og:title" content={cfg.title} />
				<Meta property="og:description" content={cfg.description} />
				<Title>{`关于 - ${cfg.title}`}</Title>
			</MetaProvider>
			<div class="h-full grow flex flex-col justify-center w-11/12 md:w-3/5 xl:w-2/5 mx-auto">
				<div class="md:flex py-16 md:py-0 bg-gradient-to-bl from-[#ebe2cd] to-[#f7f2dd] rounded-xl my-4 items-center justify-left xl:justify-center xl:gap-8 shadow-lg p-8
    rounded-[48px] 
    shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1),0_20px_40px_-15px_rgba(0,0,0,0.05)]
    border border-gray-200/50
    ring-1 ring-white inset
    transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
    cursor-auto bg-opacity-10">
					<div class="flex md:flex-col items-center justify-center">
						<div class="relative my-8 md:mx-20 md:my-16 xl:my-24 xl:mr-28">
							<img
								class="w-36 h-36 sm:w-28 sm:h-28 md:w-48 md:h-48 md:rounded-xl rounded-full not-prose object-cover shrink-0"
								src="/avatar.svg"
								alt="avatar"
								loading="lazy"
							/>
						</div>
					</div>
					<div class="text-center md:text-left not-prose flex flex-col leading-snug mx-6 pb-8 md:pb-0 justify-between gap-4 md:gap-6 font-sans">
						<div class="text-stone-500 text-3xl md:text-2xl font-bold">
							<Reveal>{cfg.author}</Reveal>
						</div>
						<div class="mx-auto text-[15px] sm:text-[13px] md:ml-px flex flex-col gap-2 sm:gap-1">
							<For
								each={[
									"ZHO / ENG",
									"on busy",
								]}
							>
								{(i) => (
									<div class="pointer-events-none select-none text-zinc-500">{i}</div>
								)}
							</For>
							<div
								id="shuffle-tag"
								class="text-zinc-500 pb-1 select-none blur-md font-sans hover:blur-none transition-all"
								onMouseLeave={delayIncreaseIdx}
							>
								{randDesc[descIdx()]}
							</div>
							<div class="pointer-events-none text-zinc-400 not-prose font-sans">
								{cfg.about.lorem[Math.floor(Math.random() * 10 % 2)]}
							</div>
						</div>
					</div>
				</div>

				<div class="flex gap-3 transition-all justify-between duration-500 overflow-x-scroll scrollbar-none sm:overflow-visible pb-3 sm:py-0">
					<For each={qlProps().slice(0, 6)}>
						{(i, index) => (
							<div class="transition-all duration-500 delay-75"
								classList={{
									"flex-1": activeLinkIndex() === index(),
									"flex-none": activeLinkIndex() !== index(),
								}}
								onMouseEnter={() => handleMouseEnter(index())}
								onMouseLeave={handleMouseLeave}>
								<QuickLinks {...i} />
							</div>
						)}
					</For>
				</div>
			</div>
		</>
	);
}
