import { A, useLocation } from "@solidjs/router";
import {
	createEffect,
	createMemo,
	createSignal,
	For,
	Show,
	type Component,
} from "solid-js";
import cfg from "../constant";

const Header: Component = () => {
	const location = useLocation();
	const onTop = createMemo(() => location.pathname === "/");
	const menu = cfg.menu;

	// Dot hover morph (square ↔ circle)
	const [dotHovered, setDotHovered] = createSignal(false);

	// Desktop nav pill tracking
	const [hoveredIdx, setHoveredIdx] = createSignal<number | null>(null);
	const [pill, setPill] = createSignal<{
		left: number;
		top: number;
		width: number;
		height: number;
	} | null>(null);
	let navRef: HTMLElement | undefined;
	const tabRefs: (HTMLButtonElement | undefined)[] = [];

	createEffect(() => {
		const idx = hoveredIdx();
		if (idx === null || !navRef) {
			setPill(null);
			return;
		}
		const el = tabRefs[idx];
		if (el && navRef) {
			const er = el.getBoundingClientRect();
			const nr = navRef.getBoundingClientRect();
			setPill({
				left: er.left - nr.left,
				top: er.top - nr.top,
				width: er.width,
				height: er.height,
			});
		}
	});

	// Mobile hamburger
	const [menuOpen, setMenuOpen] = createSignal(false);

	return (
		<header
			class="flex w-full items-center justify-between z-40 px-4.5 pt-3.5 pb-2.5 md:px-9 md:pt-5.5 md:pb-3.5"
			style={{
				position: onTop() ? "fixed" : "static",
				top: onTop() ? "0" : undefined,
				"pointer-events": onTop() ? "none" : undefined,
			}}
		>
			{/* Left: dot + site name */}
			<A
				href="/"
				class="flex items-center no-underline"
				style={{ gap: "10px", cursor: "pointer", "pointer-events": "auto" }}
				onMouseEnter={() => setDotHovered(true)}
				onMouseLeave={() => setDotHovered(false)}
			>
				<div style={{ position: "relative", width: "16px", height: "16px" }}>
					<div
						class="transform-gpu"
						style={{
							position: "absolute",
							inset: "0",
							background: dotHovered() ? "#b5caa0" : "transparent",
							"border-radius": dotHovered() ? "50%" : "2px",
							border: dotHovered() ? "none" : "1.5px solid #8dab70",
							"box-shadow": dotHovered()
								? "0 4px 10px rgba(141,171,112,0.35)"
								: "none",
							transition: "all 0.55s cubic-bezier(0.32,0.72,0,0.75) 0.2s",
							transform: dotHovered() ? "scale(1)" : "scale(0.85)",
						}}
					/>
				</div>
				<span
					class="font-mono"
					style={{ "font-size": "13px", color: "#8b8b86" }}
				>
					{cfg.title}
				</span>
			</A>

			{/* Desktop nav with sliding pill */}
			<nav
				ref={navRef}
				class="hidden md:flex items-center relative"
				style={{ padding: "4px", "pointer-events": "auto" }}
				onMouseLeave={() => setHoveredIdx(null)}
			>
				<Show when={pill()}>
					{(p) => (
						<div
							style={{
								position: "absolute",
								left: `${p().left}px`,
								top: `${p().top}px`,
								width: `${p().width}px`,
								height: `${p().height}px`,
								background: "#ccdabc",
								"border-radius": "6px",
								transition: "all 0.22s cubic-bezier(0.32,0.72,0,0.75)",
								opacity: "0.85",
								"z-index": "0",
							}}
						/>
					)}
				</Show>
				<For each={menu}>
					{(tab, idx) => (
						<A
							ref={(el) => {
								tabRefs[idx()] = el;
							}}
							href={tab.url}
							class="font-sans bg-transparent border-none cursor-pointer relative z-1 no-underline"
							classList={{
								"[&:not(:hover)]:opacity-0": tab.url === "/me",
							}}
							style={{
								padding: "6px 12px",
								"font-size": "15px",
								color: hoveredIdx() === idx() ? "#2a2a28" : "#8b8b86",
								transition: "color 0.25s ease 0.15s",
							}}
							onMouseEnter={() => setHoveredIdx(idx())}
							onClick={() => {
								if (tab.url.startsWith("http")) {
									window.open(tab.url, "_blank");
								}
							}}
						>
							{tab.name}
						</A>
					)}
				</For>
			</nav>

			{/* Mobile hamburger */}
			<button
				class="md:hidden flex flex-col bg-transparent border-none cursor-pointer"
				style={{ padding: "4px", gap: "4px", "pointer-events": "auto" }}
				onClick={() => setMenuOpen((o) => !o)}
			>
				{[0, 1, 2].map((i) => (
					<span
						class="transform-gpu"
						style={{
							width: "18px",
							height: "1.5px",
							background: "#4a4a48",
							transition: "transform 0.25s",
							transform: menuOpen()
								? i === 0
									? "translateY(5.5px) rotate(45deg)"
									: i === 2
										? "translateY(-5.5px) rotate(-45deg)"
										: "scaleX(0)"
								: "none",
						}}
					/>
				))}
			</button>

			{/* Mobile drawer */}
			<Show when={menuOpen()}>
				<div
					class="md:hidden"
					style={{
						position: "absolute",
						top: "50px",
						right: "14px",
						background: "#fff",
						border: "1px solid #ebe9e1",
						"border-radius": "8px",
						padding: "6px",
						"z-index": "10",
						"box-shadow": "0 6px 18px rgba(0,0,0,0.06)",
						"min-width": "130px",
						"pointer-events": "auto",
					}}
				>
					<For each={menu}>
						{(tab) => (
							<A
								href={tab.url}
								class="font-sans cursor-pointer block no-underline"
								style={{
									padding: "8px 12px",
									"font-size": "15px",
									color: "#4a4a48",
									"border-radius": "4px",
								}}
								onClick={() => {
									setMenuOpen(false);
									if (tab.url.startsWith("http")) {
										window.open(tab.url, "_blank");
									}
								}}
							>
								{tab.name}
							</A>
						)}
					</For>
				</div>
			</Show>
		</header>
	);
};

export default Header;
