import {
	type Component,
	Index,
	Show,
	createEffect,
	onCleanup,
	createSignal,
	createMemo,
	onMount,
	type ResolvedChildren,
} from "solid-js";
import { useLocation } from "@solidjs/router";
import { createEventDispatcher } from "@solid-primitives/event-dispatcher";
import { usePageState } from "./PageState";

export const TableOfContents: Component<{
	children: ResolvedChildren;
	onCurrentSectionChanged?: (evt: CustomEvent<string>) => void;
	progress?: number;
	readingTime?: number;
}> = (props) => {
	const location = useLocation();
	const [currentSection, setCurrentSection] = createSignal("");
	const { setPageSections, pageSections } = usePageState();
	const dispatch = createEventDispatcher(props);

	const onScroll = () => {
		const headings = document.querySelectorAll("main h2, main h3, main h4");
		let current = "";
		headings.forEach((heading) => {
			if (heading.getBoundingClientRect().top < 300) {
				current = heading.id;
				dispatch("currentSectionChanged", current);
			}
		});
		setCurrentSection(current);
	};

	createEffect(() => {
		window.addEventListener("scroll", onScroll);
		onCleanup(() => {
			window.removeEventListener("scroll", onScroll);
		});
	});

	function getHeaders(children: ResolvedChildren) {
		if (children) {
			if (!Array.isArray(children)) return;
			const firstElement = children.find(
				(child) => child instanceof HTMLElement,
			) as HTMLElement | null;
			if (firstElement && !firstElement.isConnected) return;
		}

		const headings = document.querySelectorAll("main h2, main h3, main h4");
		const sections: any = [];

		if (headings) {
			headings.forEach((heading) => {
				switch (heading.tagName) {
					case "H2":
						sections.push({
							text: heading.textContent,
							id: heading.id,
							level: 1,
							children: [],
						});
						break;
					case "H3":
						sections[sections.length - 1]?.children.push({
							text: heading.textContent,
							id: heading.id,
							level: 2,
							children: [],
						});
						break;
					case "H4": {
						const parent = sections[sections.length - 1];
						const lastChild = parent?.children[parent.children.length - 1];
						lastChild?.children.push({
							text: heading.textContent,
							id: heading.id,
							level: 3,
						});
						break;
					}
				}
			});
		}

		setPageSections({
			path: location.pathname,
			sections: sections,
		});
	}

	createEffect(() => getHeaders(props.children));

	onMount(() => {
		document.addEventListener("layout-mounted", () =>
			getHeaders(props.children),
		);
	});

	const flatSections = createMemo(() => {
		const flat: { id: string; text: string | undefined; level: number }[] = [];
		for (const section of pageSections.sections) {
			if (section.id) {
				flat.push({ id: section.id, text: section.text, level: 1 });
			}
			for (const child of section.children) {
				flat.push({ id: child.id, text: child.text, level: 2 });
				if (child.children) {
					for (const sub of child.children) {
						flat.push({ id: sub.id, text: sub.text, level: 3 });
					}
				}
			}
		}
		return flat;
	});

	return (
		<div>
			<div
				class="font-mono text-ink-mute"
				style={{ "font-size": "10px", "letter-spacing": "0.2em", "margin-bottom": "14px", "text-transform": "uppercase" }}
			>
				On this page
			</div>
			<ol style={{ "list-style": "none", padding: "0", margin: "0", display: "flex", "flex-direction": "column", gap: "6px" }}>
				<Index each={flatSections()}>
					{(section) => {
						const isActive = () => currentSection() === section().id;
						const indent = () => section().level === 2 ? 14 : section().level === 3 ? 22 : 0;
						return (
							<li
								style={{
									"font-size": "12.5px",
									"line-height": "1.5",
									"padding-left": `${indent() + 8}px`,
									"margin-left": "-8px",
									"border-left": isActive() ? "2px solid #6f9052" : "2px solid transparent",
									color: isActive() ? "#2a2a28" : "#8b8b86",
									cursor: "pointer",
									transition: "all 0.2s cubic-bezier(0.32, 0.72, 0, 0.75)",
								}}
								onClick={() => {
									const el = document.getElementById(section().id);
									if (el) el.scrollIntoView({ behavior: "smooth" });
								}}
							>
								{section().text}
							</li>
						);
					}}
				</Index>
			</ol>

			<Show when={props.progress !== undefined}>
				<div style={{
					"margin-top": "36px",
					"padding-top": "14px",
					"border-top": "1px solid #ebe9e1",
					display: "flex",
					"flex-direction": "column",
					gap: "6px",
				}}>
					<div class="font-mono text-ink-mute uppercase" style={{ "font-size": "10px", "letter-spacing": "0.15em" }}>
						Reading
					</div>
					<div class="font-mono" style={{ "font-size": "11px", color: "#4a4a48" }}>
						{Math.round((props.progress ?? 0) * 100)}%
						<Show when={props.readingTime}>
							{(time) => {
								const remaining = () => Math.max(1, Math.ceil(time() * (1 - (props.progress ?? 0))));
								return <span> · ~{remaining()} min left</span>;
							}}
						</Show>
					</div>
				</div>
			</Show>
		</div>
	);
};
