import {
	createEffect,
	createMemo,
	createSignal,
	For,
	Show,
	Suspense,
} from "solid-js";
import { A, createAsync } from "@solidjs/router";
import cfg from "../constant";
import { Link, Meta, Title } from "@solidjs/meta";
import { useTaxoJumpState, useTaxoTypeState } from "./PageState";
import {
	type MateriaType,
	preprocessed as raw,
	getSeason,
	seasonNames,
} from "./Arti";
import Spinner from "./Spinner";

export enum Bi {
	tag = 0,
	cat = 1,
}

const seasonColors: Record<string, string> = {
	春: "bg-sprout-300",
	夏: "bg-summer",
	秋: "bg-ouchi-400",
	冬: "bg-chill-300",
};

export default function Taxo() {
	const { setTaxoType, taxoType } = useTaxoTypeState();
	const [mode, setMode] = createSignal<"cat" | "tag">(
		taxoType.type === Bi.tag ? "tag" : "cat",
	);
	const [selected, setSelected] = createSignal<string | null>(
		taxoType.extra || null,
	);
	const [hoverCell, setHoverCell] = createSignal<string | null>(null);
	const [hoverPost, setHoverPost] = createSignal<MateriaType[0] | null>(null);

	const { setTaxoJump, taxoJump } = useTaxoJumpState();

	createEffect(() => {
		setMode(taxoType.type === Bi.tag ? "tag" : "cat");
	});

	createEffect(() => {
		if (taxoType.extra && taxoType.extra !== selected()) {
			setSelected(taxoType.extra);
		}
	});

	const [element, setElement] = createSignal<HTMLDivElement>();
	createEffect(() => {
		if (element() && taxoJump.id) {
			setSelected(taxoJump.id);
			setTaxoJump({ id: undefined });
		}
	});

	const rawData = createAsync(
		async () => {
			const preprocessed = await raw;

			const cateArtisMap: Map<string, MateriaType> = new Map();
			const tagArtisMap: Map<string, MateriaType> = new Map();

			for (const a of preprocessed) {
				if (a.categories) {
					for (const c of a.categories) {
						const existing = cateArtisMap.get(c) ?? [];
						existing.push(a);
						cateArtisMap.set(c, existing);
					}
				}
				if (a.tags) {
					for (const t of a.tags) {
						const existing = tagArtisMap.get(t) ?? [];
						existing.push(a);
						tagArtisMap.set(t, existing);
					}
				}
			}

			return { posts: preprocessed, cate: cateArtisMap, tag: tagArtisMap };
		},
		{ deferStream: true },
	);

	const counts = createMemo(() => {
		const data = rawData();
		if (!data) return [];
		const map = mode() === "cat" ? data.cate : data.tag;
		return Array.from(map.entries())
			.map(([name, posts]) => ({ name, count: posts.length }))
			.toSorted((a, b) => b.count - a.count);
	});

	const filteredPosts = createMemo(() => {
		const data = rawData();
		if (!data) return [];
		const sel = selected();
		if (!sel) return data.posts;
		const map = mode() === "cat" ? data.cate : data.tag;
		return map.get(sel) ?? [];
	});

	const heatmapMatrix = createMemo(() => {
		const data = rawData();
		if (!data)
			return {
				years: [] as number[],
				matrix: [] as { y: number; months: (MateriaType[0] | null)[] }[],
			};
		const years = [
			...new Set(data.posts.map((p) => p.date.getFullYear())),
		].sort((a, b) => b - a);
		const matrix = years.map((y) => {
			const months: ((typeof data.posts)[0] | null)[] = Array.from(
				{ length: 12 },
				() => null,
			);
			data.posts
				.filter((p) => p.date.getFullYear() === y)
				.forEach((p) => {
					const m = p.date.getMonth();
					if (!months[m]) months[m] = p;
				});
			return { y, months };
		});
		return { years, matrix };
	});

	const articleRows = createMemo(() => {
		const posts = filteredPosts();
		const out: {
			post: (typeof posts)[0];
			yearChanged: boolean;
			seasonChanged: boolean;
		}[] = [];
		let prevY: number | null = null;
		let prevS: number | null = null;
		for (const p of posts) {
			const y = p.date.getFullYear();
			const s = getSeason(p.date);
			const yc = y !== prevY;
			const sc = yc || s !== prevS;
			out.push({ post: p, yearChanged: yc, seasonChanged: sc });
			prevY = y;
			prevS = s;
		}
		return out;
	});

	const matchSelected = (p: any) => {
		const sel = selected();
		if (!sel) return true;
		if (mode() === "cat") return p.categories?.includes(sel);
		return p.tags?.includes(sel);
	};

	return (
		<Suspense fallback={<Spinner />}>
			<Show when={rawData()}>
				{(_ctx) => (
					<div
						ref={setElement}
						class="flex flex-col overflow-hidden"
						style={{ height: "calc(100vh - 40px)" }}
					>
						<Title>分类 - {cfg.title}</Title>
						<Link rel="canonical" href={cfg.base_url + "/taxonomy"} />
						<Meta property="og:url" content={cfg.base_url + "/taxonomy"} />
						<Meta property="og:title" content={`分类 - ${cfg.title}`} />
						<Meta property="og:description" content={cfg.description} />
						<Meta name="description" content={cfg.description} />
						<Meta name="twitter:card" content="summary" />
						<Meta name="twitter:title" content={`分类 - ${cfg.title}`} />
						<Meta name="twitter:description" content={cfg.description} />
						<Meta name="author" content={cfg.author} />

						{/* Segmented toggle */}
						<div class="flex justify-center py-3 px-9 shrink-0">
							<div class="inline-flex bg-white border border-rule rounded-lg p-0.75">
								<For
									each={[
										{ k: "cat" as const, label: "目录", aside: "category" },
										{ k: "tag" as const, label: "标签", aside: "tags" },
									]}
								>
									{(opt) => (
										<button
											class="border-none rounded-md cursor-pointer transition-all duration-200 flex items-baseline gap-1.5 font-sans"
											style={{
												background:
													mode() === opt.k ? "#ccdabc" : "transparent",
												padding: "5px 18px",
												"font-size": "14px",
												color: mode() === opt.k ? "#2a2a28" : "#8b8b86",
											}}
											onClick={() => {
												setMode(opt.k);
												setSelected(null);
												setTaxoType({
													type: opt.k === "cat" ? Bi.cat : Bi.tag,
												});
											}}
										>
											{opt.label}
											<span
												class="font-mono"
												style={{
													"font-size": "10px",
													opacity: "0.6",
													"letter-spacing": "0.1em",
												}}
											>
												{opt.aside}
											</span>
										</button>
									)}
								</For>
							</div>
						</div>

						{/* Desktop: two-column body */}
						<div
							class="hidden md:grid flex-1 min-h-0 mx-auto w-full"
							style={{
								"grid-template-columns": "1fr 1px 260px",
								"max-width": "1100px",
							}}
						>
							{/* LEFT: heatmap + filtered article list */}
							<div class="flex flex-col min-h-0 px-7 pl-9">
								{/* Heatmap */}
								<div class="pb-3 border-b border-rule shrink-0 relative">
									<div
										class="font-mono text-ink-mute mb-2"
										style={{ "font-size": "10px", "letter-spacing": "0.2em" }}
									>
										ARCHIVE · {rawData()!.posts.length} ENTRIES ·{" "}
										{heatmapMatrix().years.length} YEARS
										<Show when={selected()}>
											<span class="text-sprout-700 ml-2.5">
												FILTERED · {filteredPosts().length}
											</span>
										</Show>
									</div>
									<div
										class="grid gap-3 mb-1.25"
										style={{
											"grid-template-columns":
												"32px repeat(12, minmax(0, 22px))",
										}}
									>
										<div />
										<For
											each={[
												"1",
												"2",
												"3",
												"4",
												"5",
												"6",
												"7",
												"8",
												"9",
												"10",
												"11",
												"12",
											]}
										>
											{(m) => (
												<div
													class="font-mono text-ink-mute text-center"
													style={{ "font-size": "9px" }}
												>
													{m}
												</div>
											)}
										</For>
									</div>
									<For each={heatmapMatrix().matrix}>
										{(row) => (
											<div
												class="grid gap-3 mb-3"
												style={{
													"grid-template-columns":
														"32px repeat(12, minmax(0, 22px))",
												}}
											>
												<div
													class="font-mono text-ink-soft self-center"
													style={{ "font-size": "11px" }}
												>
													{row.y}
												</div>
												<For each={row.months}>
													{(p, mi) => {
														const k = () => `${row.y}.${mi()}`;
														const lit = () => p && matchSelected(p);
														return (
															<div
																class="rounded-sm cursor-pointer transition-all duration-200"
																style={{
																	"aspect-ratio": "1",
																	"max-height": "22px",
																	background: !p
																		? "#ebe9e1"
																		: lit()
																			? "#8dab70"
																			: "#e4ecdb",
																	transform:
																		hoverCell() === k()
																			? "scale(1.2)"
																			: "scale(1)",
																	"box-shadow":
																		hoverCell() === k()
																			? "0 3px 8px rgba(0,0,0,0.12)"
																			: "none",
																}}
																onmouseenter={() => {
																	if (p) {
																		setHoverCell(k());
																		setHoverPost(p);
																	}
																}}
																onmouseleave={() => {
																	setHoverCell(null);
																	setHoverPost(null);
																}}
															/>
														);
													}}
												</For>
											</div>
										)}
									</For>
									<div
										class="flex items-center gap-2.5 mt-2 font-mono text-ink-mute"
										style={{ "font-size": "11px" }}
									>
										<span>less</span>
										<For
											each={[
												"#ebe9e1",
												"#e4ecdb",
												"#b5caa0",
												"#8dab70",
												"#55713f",
											]}
										>
											{(c) => (
												<div
													style={{
														width: "11px",
														height: "11px",
														background: c,
														"border-radius": "2px",
													}}
												/>
											)}
										</For>
										<span>more</span>
										<Show when={hoverCell()}>
											{(cell) => {
												const [ri, mi] = cell().split(".").map(Number);
												const row = heatmapMatrix().matrix.find(
													(r) => r.y === heatmapMatrix().years[ri!],
												);
												const p = row?.months[mi!];
												return p ? (
													<span class="ml-auto text-ink-soft">
														<span class="text-ink">
															{p.date.getFullYear()}/
															{p.date.toLocaleDateString("en-US", {
																month: "2-digit",
																day: "2-digit",
															})}
														</span>{" "}
														· {p.title}
													</span>
												) : null;
											}}
										</Show>
									</div>
									{/* Hover preview card */}
									<Show when={hoverPost()}>
										{(post) => (
											<div
												class="absolute bottom-2 right-0 bg-white border border-rule rounded-md pointer-events-none"
												style={{
													width: "240px",
													padding: "10px 12px",
													"box-shadow": "0 4px 12px rgba(0,0,0,0.08)",
													"z-index": "10",
												}}
											>
												<div
													class="font-serif text-ink"
													style={{
														"font-size": "14px",
														"line-height": "1.4",
														"margin-bottom": "4px",
													}}
												>
													{post().title}
												</div>
												<div
													class="font-mono text-ink-mute"
													style={{
														"font-size": "11px",
														"margin-bottom": "4px",
													}}
												>
													{post().date.getFullYear()}/
													{post().date.toLocaleDateString("en-US", {
														month: "2-digit",
														day: "2-digit",
													})}
													{post().categories?.at(0) && (
														<span class="text-sprout-600 ml-1.5">
															· {post().categories!.at(0)}
														</span>
													)}
												</div>
												<Show when={(post() as any).description}>
													<div
														class="text-ink-soft"
														style={{
															"font-size": "12px",
															"line-height": "1.4",
															overflow: "hidden",
															display: "-webkit-box",
															"-webkit-line-clamp": "2",
															"-webkit-box-orient": "vertical",
														}}
													>
														{(post() as any).description}
													</div>
												</Show>
											</div>
										)}
									</Show>
								</div>

								{/* Filtered article list */}
								<div class="flex-1 overflow-y-auto py-3 min-h-0 scrollbar-none">
									<div
										class="font-mono text-ink-mute mb-1.5"
										style={{ "font-size": "10px", "letter-spacing": "0.2em" }}
									>
										{selected()
											? `${mode() === "cat" ? "CATEGORY" : "TAG"} · ${selected()!.toUpperCase()} · ${filteredPosts().length}`
											: `ALL · ${rawData()!.posts.length}`}
									</div>
									<For each={articleRows()}>
										{(row, i) => (
											<>
												<Show when={row.yearChanged}>
													<div
														class="text-ink font-normal"
														style={{
															"font-size": "18px",
															"margin-top": i() === 0 ? "4px" : "18px",
															"margin-bottom": "2px",
														}}
													>
														{row.post.date.getFullYear()}
													</div>
												</Show>
												<Show when={row.seasonChanged}>
													<div
														class="font-mono inline-flex items-center gap-1.25 text-ink-mute"
														style={{
															"font-size": "11px",
															margin: row.yearChanged
																? "1px 0 4px"
																: "8px 0 1px",
														}}
													>
														<span
															class={`w-1.25 h-1.25 rounded-full ${seasonColors[seasonNames[getSeason(row.post.date)]!]}`}
														/>
														{seasonNames[getSeason(row.post.date)]}
													</div>
												</Show>
												<div
													class="grid items-baseline rounded-sm cursor-pointer transition-colors duration-150"
													style={{
														"grid-template-columns": "50px 1fr auto",
														gap: "14px",
														padding: "4px 6px",
														margin: "0 -6px",
													}}
													// onmouseenter={(e) => {
													// 	e.currentTarget.style.background =
													// 		"rgba(228, 236, 219, 0.55)";
													// 	setHoverPost(row.post);
													// }}
													// onmouseleave={(e) => {
													// 	e.currentTarget.style.background = "transparent";
													// 	setHoverPost(null);
													// }}
												>
													<div
														class="font-mono text-ink-mute"
														style={{
															"font-size": "12px",
															"font-variant-numeric": "tabular-nums",
														}}
													>
														{row.post.date.toLocaleDateString("en-US", {
															month: "2-digit",
															day: "2-digit",
														})}
													</div>
													<div
														style={{
															"font-size": "14.5px",
															"line-height": "1.5",
														}}
													>
														<A
															href={`/${row.post._meta.path}`}
															class="no-underline text-ink group"
														>
															{row.post.title}
															<span class="block max-w-0 group-hover:max-w-full transition-all duration-350 h-px bg-sprout-500" />
														</A>
													</div>
													<div
														class="font-serif italic text-ink-mute"
														style={{ "font-size": "12px" }}
													>
														{row.post.categories?.at(0) ?? ""}
													</div>
												</div>
											</>
										)}
									</For>
									<Show when={filteredPosts().length === 0}>
										<div
											class="text-center py-10 text-ink-mute font-mono"
											style={{ "font-size": "12px" }}
										>
											no entries
										</div>
									</Show>
								</div>
							</div>

							{/* Divider */}
							<div class="bg-rule" />

							{/* RIGHT: tag/category rail */}
							<aside class="flex flex-col min-h-0">
								<div class="px-6 pb-2.5 border-b border-rule">
									<div
										class="font-mono text-ink-mute"
										style={{ "font-size": "10px", "letter-spacing": "0.2em" }}
									>
										{mode() === "cat" ? "CATEGORIES" : "TAGS"} ·{" "}
										{counts().length}
									</div>
									<Show when={selected()}>
										<div
											class="font-mono mt-1 cursor-pointer text-cerise-500"
											style={{ "font-size": "11px" }}
											onClick={() => setSelected(null)}
										>
											× clear
										</div>
									</Show>
								</div>
								<div class="flex-1 overflow-y-auto py-2.5 px-4 min-h-0 scrollbar-none">
									<div class="flex flex-col gap-px">
										<For each={counts()}>
											{(item) => {
												const active = () => selected() === item.name;
												return (
													<button
														class={`border-none text-left flex justify-between items-baseline cursor-pointer rounded-sm transition-all duration-150 ${mode() === "cat" ? "font-serif" : "font-sans"}`}
														style={{
															background: active() ? "#e4ecdb" : "transparent",
															padding: "5px 8px",
															"font-size": "14px",
															color: active() ? "#435833" : "#4a4a48",
															"font-style":
																mode() === "cat" ? "italic" : "normal",
															"letter-spacing":
																mode() === "cat" ? "0.02em" : "0",
														}}
														onClick={() =>
															setSelected(active() ? null : item.name)
														}
														onmouseenter={(e) => {
															if (!active())
																e.currentTarget.style.background =
																	"rgba(228, 236, 219, 0.35)";
														}}
														onmouseleave={(e) => {
															if (!active())
																e.currentTarget.style.background =
																	"transparent";
														}}
													>
														<span>{item.name}</span>
														<span
															class="font-mono text-ink-mute"
															style={{ "font-size": "12px" }}
														>
															{item.count}
														</span>
													</button>
												);
											}}
										</For>
									</div>
								</div>
							</aside>
						</div>

						{/* Mobile: single-column layout */}
						<div class="md:hidden flex flex-col flex-1 min-h-0 overflow-hidden">
							<div class="px-4.5 pb-2.5 overflow-x-auto whitespace-nowrap scrollbar-none shrink-0">
								<div class="inline-flex gap-1.5">
									<For each={counts()}>
										{(item) => {
											const active = () => selected() === item.name;
											return (
												<button
													class={`inline-flex items-baseline gap-1.25 cursor-pointer ${mode() === "cat" ? "font-serif" : "font-sans"}`}
													style={{
														background: active() ? "#e4ecdb" : "#fff",
														color: active() ? "#435833" : "#4a4a48",
														border: `1px solid ${active() ? "#b5caa0" : "#ebe9e1"}`,
														"border-radius": "999px",
														padding: "4px 10px",
														"font-size": "13px",
														"font-style":
															mode() === "cat" && active()
																? "italic"
																: "normal",
													}}
													onClick={() =>
														setSelected(active() ? null : item.name)
													}
												>
													{item.name}
													<span
														class="font-mono text-ink-mute"
														style={{ "font-size": "10px" }}
													>
														{item.count}
													</span>
												</button>
											);
										}}
									</For>
								</div>
							</div>

							<div class="h-px bg-rule mx-4.5" />

							<div class="flex-1 overflow-y-auto px-5 py-2.5 min-h-0">
								<div
									class="font-mono text-ink-mute mb-1.5"
									style={{ "font-size": "10px", "letter-spacing": "0.15em" }}
								>
									{selected()
										? `${selected()!.toUpperCase()} · ${filteredPosts().length} ENTRIES`
										: `ALL · ${filteredPosts().length} ENTRIES`}
								</div>
								<For each={articleRows()}>
									{(row, i) => (
										<>
											<Show when={row.yearChanged}>
												<div
													class="text-ink"
													style={{
														"font-size": "17px",
														"margin-top": i() === 0 ? "4px" : "16px",
														"margin-bottom": "2px",
													}}
												>
													{row.post.date.getFullYear()}
												</div>
											</Show>
											<Show when={row.seasonChanged}>
												<div
													class="font-mono inline-flex items-center gap-1.25 text-ink-mute"
													style={{
														"font-size": "11px",
														margin: row.yearChanged ? "1px 0 4px" : "8px 0 1px",
													}}
												>
													<span
														class={`w-1.25 h-1.25 rounded-full ${seasonColors[seasonNames[getSeason(row.post.date)]!]}`}
													/>
													{seasonNames[getSeason(row.post.date)]}
												</div>
											</Show>
											<div
												class="grid items-baseline"
												style={{
													"grid-template-columns": "36px 1fr",
													gap: "10px",
													padding: "5px 0",
												}}
											>
												<div
													class="font-mono text-ink-mute"
													style={{
														"font-size": "11.5px",
														"font-variant-numeric": "tabular-nums",
													}}
												>
													{row.post.date.toLocaleDateString("en-US", {
														month: "2-digit",
														day: "2-digit",
													})}
												</div>
												<A
													href={`/${row.post._meta.path}`}
													class="no-underline text-ink"
													style={{ "font-size": "14px", "line-height": "1.45" }}
												>
													{row.post.title}
												</A>
											</div>
										</>
									)}
								</For>
							</div>
						</div>
					</div>
				)}
			</Show>
		</Suspense>
	);
}
