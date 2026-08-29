import { A, createAsync } from "@solidjs/router";
import { type Component, Index, Show, Suspense, createSignal } from "solid-js";
import { useTaxoJumpState, useTaxoTypeState } from "./PageState";
import Spinner from "./Spinner";
import { allPosts } from "content-collections";

export const allContent = [...(allPosts || [])];
export const contentMap = new Map(allContent.map((d) => [d._meta.path, d]));
import { Bi } from "./Taxo";

export const preprocessed = Promise.all(allContent).then((res) =>
	res
		.filter((i) => i !== null && !i.draft)
		.toSorted((a, b) => (b.date.getTime() > a.date.getTime() ? 1 : -1)),
);

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

export type MateriaType = UnwrapPromise<typeof preprocessed>;

export const seasonNames = ["春", "夏", "秋", "冬"] as const;
const seasonColors: Record<string, string> = {
	春: "bg-sprout-300",
	夏: "bg-summer",
	秋: "bg-ouchi-400",
	冬: "bg-chill-300",
};

const solarTerms = {
	立春: { month: 2, day: 4 },
	立夏: { month: 5, day: 6 },
	立秋: { month: 8, day: 8 },
	立冬: { month: 11, day: 7 },
};

export function getSeason(date: Date): number {
	const year = date.getFullYear();
	const { 立春: lichun, 立夏: lixia, 立秋: liqiu, 立冬: lidong } = solarTerms;
	const lichunDate = new Date(year, lichun.month - 1, lichun.day);
	const lixiaDate = new Date(year, lixia.month - 1, lixia.day);
	const liqiuDate = new Date(year, liqiu.month - 1, liqiu.day);
	const lidongDate = new Date(year, lidong.month - 1, lidong.day);
	if (date >= lichunDate && date < lixiaDate) return 0;
	if (date >= lixiaDate && date < liqiuDate) return 1;
	if (date >= liqiuDate && date < lidongDate) return 2;
	return 3;
}

export const Arti: Component = () => {
	const ctx = createAsync(
		async () => {
			return await preprocessed;
		},
		{ deferStream: true },
	);

	const { setTaxoJump } = useTaxoJumpState();
	const { setTaxoType } = useTaxoTypeState();

	const [hoverRow, setHoverRow] = createSignal<number | undefined>();

	return (
		<Suspense fallback={<Spinner />}>
			<Show when={ctx()}>
				{(data) => {
					const dataArray = Array.from(data());
					return (
						<div class="w-full md:w-1/2 mx-auto pt-2 md:pt-6 px-0 md:px-6 pb-12">
							<Index each={dataArray}>
								{(attr, idx) => {
									const prevArti = dataArray[idx - 1];
									const prevYear = prevArti?.date.getFullYear();
									const prevSeason = prevArti
										? getSeason(prevArti.date)
										: undefined;
									const season = getSeason(attr().date);
									const seasonName = seasonNames[season]!;
									const yearChanged = prevYear !== attr().date.getFullYear();
									const seasonChanged =
										yearChanged ||
										(prevSeason !== undefined && prevSeason !== season);

									return (
										<>
											<Show when={yearChanged}>
												<div
													class="text-ink text-xl font-sans font-normal tracking-wide"
													style={{
														"margin-top": idx === 0 ? "0" : "22px",
														"margin-bottom": "2px",
													}}
												>
													{attr().date.getFullYear()}
												</div>
											</Show>
											<Show when={seasonChanged}>
												<div
													class="inline-flex items-center gap-1.5 font-mono text-ink-mute"
													style={{
														"font-size": "12px",
														margin: yearChanged ? "2px 0 4px" : "10px 0 2px",
													}}
												>
													<span
														class={`w-1.5 h-1.5 rounded-full ${seasonColors[seasonName]}`}
													/>
													{seasonName}
												</div>
											</Show>
											<div
												class="grid items-baseline rounded-sm cursor-pointer transition-colors duration-180 px-2 pt-5 pb-3 md:pt-2.5 md:pb-1.5"
												style={{
													"grid-template-columns": "40px 1fr auto",
													gap: "12px",
													margin: "0 -8px",
													// background:
													// 	hoverRow() === idx
													// 		? "rgba(228, 236, 219, 0.55)"
													// 		: "transparent",
												}}
												// onmouseenter={() => setHoverRow(idx)}
												// onmouseleave={() => setHoverRow(undefined)}
											>
												<div
													class="font-mono text-ink-mute"
													style={{
														"font-size": "12.5px",
														"font-variant-numeric": "tabular-nums",
													}}
												>
													{attr().date.toLocaleDateString("en-US", {
														month: "2-digit",
														day: "2-digit",
													})}
												</div>
												<div
													class="min-w-0"
													style={{
														"font-size": "15.5px",
														"line-height": "1.55",
													}}
												>
													<A
														href={`/${attr()._meta.path}`}
														class="no-underline text-ink group block"
													>
														<span class="line-clamp-2 break-words leading-snug">
															{attr().title}
														</span>
														<span class="block max-w-0 group-hover:max-w-full transition-all duration-350 h-px bg-sprout-500 mt-0.5" />
													</A>
												</div>
												<A
													href="/taxonomy"
													class="no-underline font-serif italic tracking-wide transition-colors duration-220 hover:bg-[#e4ecdb]"
													style={{
														"font-size": "12px",
														color: hoverRow() === idx ? "#435833" : "#8b8b86",
														padding: "1px 6px",
														"border-radius": "3px",
														"letter-spacing": "0.02em",
													}}
													onClick={() => {
														const fstCat = attr().categories?.at(0);
														if (fstCat) {
															setTaxoJump({ id: fstCat });
															setTaxoType({ type: Bi.cat });
														}
													}}
												>
													{attr().categories?.at(0) ?? ""}
												</A>
											</div>
										</>
									);
								}}
							</Index>
						</div>
					);
				}}
			</Show>
		</Suspense>
	);
};
