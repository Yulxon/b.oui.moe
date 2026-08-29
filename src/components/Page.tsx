import { Link, Meta, Title } from "@solidjs/meta";
import {
	Show,
	type ParentComponent,
	children,
	Suspense,
	For,
	createSignal,
	createEffect,
	createMemo,
	onCleanup,
	onMount,
} from "solid-js";
import cfg from "../constant";
import { A, useLocation } from "@solidjs/router";
import { TableOfContents } from "./Toc";
import Spinner from "./Spinner";
import { usePageState, useTaxoTypeState } from "./PageState";
import { Bi } from "./Taxo";
import { contentMap } from "./Arti";

function formatDate(date: Date | undefined) {
	if (date === undefined) return "";
	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const day = date.getDate().toString().padStart(2, "0");
	return `${year}.${month}.${day}`;
}

const Page: ParentComponent<{ isError?: false; article?: any }> = (props) => {
	const resolved = children(() => props.children);
	const location = useLocation();
	const [clientWidthGt900, setClientWidthGt900] = createSignal<boolean>();
	const [scrollProgress, setScrollProgress] = createSignal(0);
	const [currentSection, setCurrentSection] = createSignal("");
	const [readingTime, setReadingTime] = createSignal(0);
	const [tocOpen, setTocOpen] = createSignal(false);

	const handleWindowResize = () => {
		setClientWidthGt900(window.innerWidth > 900);
	};

	const handleScroll = () => {
		const docHeight =
			document.documentElement.scrollHeight - window.innerHeight;
		setScrollProgress(
			docHeight > 0 ? Math.min(1, window.scrollY / docHeight) : 0,
		);
	};

	createEffect(() => {
		handleWindowResize();
		handleScroll();
		window.addEventListener("resize", handleWindowResize);
		window.addEventListener("scroll", handleScroll);
		onCleanup(() => {
			window.removeEventListener("resize", handleWindowResize);
			window.removeEventListener("scroll", handleScroll);
		});
	});

	onMount(() => {
		const articleEl = document.querySelector("article");
		if (articleEl) {
			const text = articleEl.textContent || "";
			setReadingTime(Math.max(1, Math.ceil(text.length / 500)));
		}
	});

	const article = createMemo(() => {
		if (props.article) return props.article;
		let path = location.pathname.slice(1);
		if (path.endsWith("/")) path = path.slice(0, -1);
		return contentMap.get(path);
	});

	const currentUrl = () => {
		const path = location.pathname.endsWith("/")
			? location.pathname.slice(0, -1)
			: location.pathname;
		return `${cfg.base_url}${path}`;
	};
	const { setTaxoType } = useTaxoTypeState();
	const { pageSections } = usePageState();

	function handleSectionChange(evt: CustomEvent<string>) {
		setCurrentSection(evt.detail);
	}

	const topSections = createMemo(() =>
		pageSections.sections.filter((s) => s.id !== ""),
	);

	return (
		<Suspense fallback={<Spinner />}>
			<Show when={article()} fallback={resolved()}>
				{(articleData) => {
					const date = new Date(articleData().date);
					return (
						<>
							<Title>{`${articleData().title} - ${cfg.title}`}</Title>
							<Link rel="canonical" href={currentUrl()} />
							<Meta property="og:type" content="article" />
							<Meta property="og:url" content={currentUrl()} />
							<Meta
								name="description"
								content={articleData().description || cfg.description}
							/>
							<Meta
								property="og:title"
								content={`${articleData().title} - ${cfg.title}`}
							/>
							<Meta
								property="og:description"
								content={articleData().description || cfg.description}
							/>
							<Meta name="keywords" content={articleData().tags?.join(",")} />
							<Meta name="twitter:card" content="summary_large_image" />
							<Meta
								name="twitter:title"
								content={`${articleData().title} - ${cfg.title}`}
							/>
							<Meta
								name="twitter:description"
								content={articleData().description || cfg.description}
							/>
							<Meta
								property="article:published_time"
								content={formatDate(date).replace(/\./g, "-")}
							/>
							<script
								type="application/ld+json"
								innerHTML={JSON.stringify({
									"@context": "https://schema.org",
									"@type": "BlogPosting",
									headline: articleData().title,
									description: articleData().description || cfg.description,
									url: currentUrl(),
									datePublished: formatDate(date).replace(/\./g, "-"),
									author: { "@type": "Person", name: cfg.author },
									publisher: { "@type": "Person", name: cfg.author },
									keywords: articleData().tags?.join(","),
								})}
							/>

							{/* Reading progress bar */}
							<div
								class="fixed top-0 left-0 right-0 z-50"
								style={{ height: "2px", background: "#ebe9e1" }}
							>
								<div
									style={{
										height: "100%",
										width: `${scrollProgress() * 100}%`,
										background: "#6f9052",
										transition: "width 0.3s",
									}}
								/>
							</div>

							<Show
								when={articleData().toc && clientWidthGt900()}
								fallback={
									/* Single column (no toc or mobile) */
									<div class="relative mx-auto w-full md:w-1/2 px-6 pb-20">
										{/* Mobile sub-header with back + toc toggle */}
										<Show when={!clientWidthGt900()}>
											<div
												class="flex items-center justify-between py-2.5 border-b border-rule mb-4"
												style={{
													"margin-left": "-24px",
													"margin-right": "-24px",
													"padding-left": "24px",
													"padding-right": "24px",
												}}
											>
												<a
													href="/"
													onClick={(e) => {
														if (window.history.length > 1) {
															e.preventDefault();
															window.history.back();
														}
													}}
													class="font-mono no-underline text-ink-mute"
													style={{ "font-size": "11px" }}
												>
													← 返回
												</a>
												<Show when={articleData().toc}>
													<button
														class="font-mono border border-rule rounded bg-transparent cursor-pointer text-ink-soft"
														style={{ "font-size": "10px", padding: "3px 8px" }}
														onClick={() => setTocOpen((o) => !o)}
													>
														{tocOpen() ? "× toc" : "≡ toc"}
													</button>
												</Show>
											</div>

											{/* ToC dropdown overlay */}
											<Show when={tocOpen()}>
												<div
													class="absolute right-3.5 z-10 bg-white border border-rule rounded-md"
													style={{
														top: "40px",
														padding: "10px 14px",
														"box-shadow": "0 6px 18px rgba(0,0,0,0.06)",
														"max-width": "220px",
													}}
												>
													<TableOfContents
														onCurrentSectionChanged={(evt) => {
															handleSectionChange(evt);
															setTocOpen(false);
														}}
														children={resolved()}
													/>
												</div>
											</Show>
										</Show>

										<div
											style={{
												"padding-top": clientWidthGt900() ? "48px" : "12px",
											}}
										>
											<div
												class="flex items-center font-mono"
												style={{
													"font-size": "11px",
													color: "#8b8b86",
													"letter-spacing": "0.15em",
												}}
											>
												<A
													href="/taxonomy"
													class="no-underline text-ink-mute hover:text-sprout-600 transition-colors uppercase"
													onClick={() => {
														const cat = articleData().categories?.at(0);
														if (cat) setTaxoType({ type: Bi.cat, extra: cat });
													}}
												>
													{articleData().categories?.at(0) ?? "Uncategorized"}
												</A>
												<span class="mx-2">·</span>
												{formatDate(date)}
											</div>
											<h1
												class="font-serif-cjk"
												style={{
													"font-size": clientWidthGt900() ? "32px" : "24px",
													"font-weight": "500",
													"line-height": "1.25",
													margin: clientWidthGt900()
														? "12px 0 10px"
														: "8px 0 8px",
													"letter-spacing": "-0.005em",
												}}
											>
												{articleData().title}
												<Show when={articleData().draft}>
													<span
														class="text-ink-mute font-mono"
														style={{ "font-size": "14px" }}
													>
														{" "}
														[draft]
													</span>
												</Show>
											</h1>
											<div
												style={{
													"font-size": "14px",
													color: "#8b8b86",
													"margin-bottom": clientWidthGt900() ? "36px" : "18px",
													"line-height": "1.6",
												}}
											>
												{articleData().description}
											</div>
											<Show when={articleData().draft}>
												<div
													class="text-ink-mute font-mono mb-6"
													style={{ "font-size": "12px" }}
												>
													恭喜你发现我的🌿稿一篇呀 🎉~
												</div>
											</Show>
										</div>

										<article class="prose font-sans lg:prose-lg 2xl:prose-xl max-w-none break-words">
											{resolved()}
										</article>

										{/* Tags footer */}
										<div
											style={{
												"margin-top": "56px",
												"padding-top": "18px",
												"border-top": "1px solid #ebe9e1",
												display: "flex",
												"justify-content": "space-between",
												"align-items": "center",
											}}
										>
											<div class="flex gap-1.5 flex-wrap">
												<For each={articleData().tags}>
													{(tag) => (
														<A
															href="/taxonomy"
															class="font-mono no-underline text-ink-mute hover:text-sprout-600 transition-colors"
															style={{ "font-size": "12px" }}
															onClick={() =>
																setTaxoType({ type: Bi.tag, extra: tag })
															}
														>
															#{tag}
														</A>
													)}
												</For>
											</div>
										</div>
									</div>
								}
							>
								{/* Three-column layout (desktop with toc) */}
								<div
									class="grid w-full"
									style={{
										"grid-template-columns": "190px 1fr 60px",
										gap: "0",
										"max-width": "1280px",
										margin: "0 auto",
									}}
								>
									{/* TOC rail - sticky inside stretching grid cell */}
									<aside style={{ "padding-left": "32px", height: "100%" }}>
										<div
											style={{
												position: "sticky",
												top: "110px",
												"z-index": "10",
												display: clientWidthGt900() ? "block" : "none",
												"max-height": "calc(100vh - 200px)",
												"overflow-y": "auto",
											}}
										>
											<TableOfContents
												onCurrentSectionChanged={handleSectionChange}
												children={resolved()}
												progress={scrollProgress()}
												readingTime={readingTime()}
											/>
										</div>
									</aside>

									{/* Article content */}
									<div
										style={{
											"max-width": "768px",
											width: "100%",
											margin: "0 auto",
											padding: "110px 24px 80px",
											"line-height": "1.75",
										}}
									>
										<div
											class="flex items-center font-mono"
											style={{
												"font-size": "11px",
												color: "#8b8b86",
												"letter-spacing": "0.15em",
											}}
										>
											<A
												href="/"
												class="no-underline text-ink-mute hover:text-sprout-600 transition-colors uppercase"
											>
												Archive
											</A>
											<div class="i-ri:arrow-right-s-line mx-1.5 text-[10px]" />
											<A
												href="/taxonomy"
												class="no-underline text-ink-mute hover:text-sprout-600 transition-colors uppercase"
												onClick={() => {
													const cat = articleData().categories?.at(0);
													if (cat) setTaxoType({ type: Bi.cat, extra: cat });
												}}
											>
												{articleData().categories?.at(0) ?? "Uncategorized"}
											</A>
											<span class="mx-2">·</span>
											{formatDate(date)}
										</div>
										<h1
											class="font-serif-cjk"
											style={{
												"font-size": "32px",
												"font-weight": "500",
												"line-height": "1.25",
												margin: "12px 0 10px",
												"letter-spacing": "-0.005em",
											}}
										>
											{articleData().title}
											<Show when={articleData().draft}>
												<span
													class="text-ink-mute font-mono"
													style={{ "font-size": "14px" }}
												>
													{" "}
													[draft]
												</span>
											</Show>
										</h1>
										<div
											style={{
												"font-size": "14px",
												color: "#8b8b86",
												"margin-bottom": "36px",
												"line-height": "1.6",
											}}
										>
											{articleData().description}
										</div>
										<Show when={articleData().draft}>
											<div
												class="text-ink-mute font-mono mb-6"
												style={{ "font-size": "12px" }}
											>
												恭喜你发现我的🌿稿一篇呀 🎉~
											</div>
										</Show>

										<article class="prose font-sans lg:prose-lg 2xl:prose-xl max-w-none break-words">
											{resolved()}
										</article>

										{/* Tags footer */}
										<div
											style={{
												"margin-top": "56px",
												"padding-top": "18px",
												"border-top": "1px solid #ebe9e1",
												display: "flex",
												"justify-content": "space-between",
												"align-items": "center",
											}}
										>
											<div class="flex gap-1.5 flex-wrap">
												<For each={articleData().tags}>
													{(tag) => (
														<A
															href="/taxonomy"
															class="font-mono no-underline text-ink-mute hover:text-sprout-600 transition-colors"
															style={{ "font-size": "11px" }}
															onClick={() =>
																setTaxoType({ type: Bi.tag, extra: tag })
															}
														>
															#{tag}
														</A>
													)}
												</For>
											</div>
										</div>
									</div>

									{/* Right gutter — section markers */}
									<aside style={{ "padding-right": "14px", height: "100%" }}>
										<div
											style={{
												position: "sticky",
												top: "160px",
												display: clientWidthGt900() ? "flex" : "none",
												"flex-direction": "column",
												gap: "8px",
												"align-items": "flex-end",
												"z-index": "10",
												"max-height": "calc(100vh - 200px)",
												"overflow-y": "auto",
											}}
										>
											<For each={topSections()}>
												{(section) => (
													<div
														style={{
															width:
																currentSection() === section.id
																	? "16px"
																	: "8px",
															height: "2px",
															background:
																currentSection() === section.id
																	? "#6f9052"
																	: "#ebe9e1",
															cursor: "pointer",
															transition: "all 0.25s",
														}}
														onClick={() => {
															const el = document.getElementById(section.id);
															if (el) el.scrollIntoView({ behavior: "smooth" });
														}}
													/>
												)}
											</For>
										</div>
									</aside>
								</div>
							</Show>
						</>
					);
				}}
			</Show>
		</Suspense>
	);
};
export default Page;
