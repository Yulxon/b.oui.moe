import {
	Match,
	Switch,
	children,
	createSignal,
	onMount,
	splitProps,
	type ParentProps,
} from "solid-js";
import { A } from "@solidjs/router";
import { QuickLinks, type QuickLinksProps } from "../ingredients/QuickLink";
import { Emph, type EmphProps } from "../ingredients/Emph";
import Reveal from "~/ingredients/RandReveal";
import { twMerge } from "tailwind-merge";

const cstomLink = (props: ParentProps & { href: string }) => {
	const [, rest] = splitProps(props, ["children"]);
	const resolved = children(() => props.children);

	const [childRef, setChildRef] = createSignal<HTMLDivElement>();
	const [inlineAClass, setInlineAClass] = createSignal(
		props.href.startsWith("#") ? "anchor no-underline" : ""
	);

	onMount(() => {
		if (childRef && childRef()?.parentElement) {
			if (childRef()!.parentElement?.tagName.startsWith("H")) {
				setInlineAClass(`anchor no-underline`);
			} else {
				setInlineAClass(`anchor decoration-dotted underline-offset-4`);
			}
		}
	});

	if (props.href.startsWith("#")) {

		return (
			<A ref={setChildRef} class={inlineAClass()} {...rest} noScroll={true}>
				{resolved()}
			</A>
		);
	}

	return (
		<A
			class="underline-offset-4 decoration-2 hover:underline-offset-2 transition-all inline items-center space-x-px group break-all pr-0.5 font-normal"
			target="_blank"
			rel="noopener"
			{...rest}
		>
			<span>{resolved()}</span>
		</A>
	);
};

const imgContent = (
	props: ParentProps & {
		class: string;
		src: string;
		alt: string;
		title: string;
		ref: (el: HTMLVideoElement) => void | undefined;
	},
) => (
	<Switch
		fallback={
			<img
				class={`w-full ${props.class}`}
				src={props.src}
				alt={props.alt}
				loading="lazy"
			/>
		}
	>
		<Match when={!props.src.startsWith("http")}>
			<img
				class={`w-full ${props.class}`}
				src={props.src}
				alt={props.alt}
				loading="lazy"
			/>
		</Match>

		<Match when={props.src.endsWith(".webm")}>
			<video
				ref={props.ref}
				src={props.src}
				class={`w-full squircle rounded-md ${props.class}`}
				controls={props.title === "controls"}
				muted={props.title !== "controls"}
				autoplay={props.title !== "controls"}
				loop={props.title !== "controls"}
				preload="metadata"
				playsinline
			>
				<source src={props.src} type="video/webm" />
			</video>
		</Match>
	</Switch>
);

const components = {
	p: (props: ParentProps) => <p {...props} class="leading-relaxed font-sans text-md">{props.children}</p>,
	nav: (props: ParentProps) => <nav {...props}>{props.children}</nav>,
	hr: (props: ParentProps) => {
		return <hr {...props} class="bg-sprout-100 rounded-xl h-0.5 w-full" />;
	},
	pre: (props: ParentProps & { class?: string; className?: string }) => {
		const [local, rest] = splitProps(props, ["class", "className", "children"]);
		const [codeBlockRef, setCodeBlockRef] = createSignal<
			HTMLDivElement | undefined
		>();
		const [copied, setCopied] = createSignal(false);
		const copyToClipboard = () => {
			if (codeBlockRef()) {
				const codeContent = codeBlockRef()!.innerText; // loaded

				if (codeContent) {
					navigator.clipboard.writeText(codeContent).then(() => {
						setCopied(true);
						setTimeout(() => setCopied(false), 2000);
					});
				}
			}
		};
		return (
			<div class="relative group w-full">
				<pre
					{...rest}
					class={twMerge("w-full border bg-[#faf9f5] px-4 py-2.5 overflow-auto scrollbar scrollbar-rounded text-[#393a34]", local.class, local.className)}
					ref={setCodeBlockRef}
				>
					{local.children}
				</pre>
				<button
					class="absolute bg-transparent right-2 top-2 h-8 w-8 justify-center items-center flex rounded-md hover:bg-sprout-100 transition-all"
					onClick={copyToClipboard}
				>
					<div
						class={twMerge(
							"transition-all duration-400 group-hover:text-sprout-500",
							copied() ? "group-hover:i-ci:check" : "group-hover:i-ci:copy",
						)}
					/>
				</button>
			</div>
		);
	},
	code: (props: ParentProps & { class?: string; className?: string }) => {
		const [local, rest] = splitProps(props, ["class", "className", "children"]);
		const [childRef, setChildRef] = createSignal<HTMLDivElement>();
		const [inlineCodeClass, setInlineCodeClass] = createSignal("");

		onMount(() => {
			if (childRef && childRef()?.parentElement) {
				if (childRef()!.parentElement?.tagName !== "PRE") {
					setInlineCodeClass("bg-sprout-100 px-1 pt-0.5 text-sprout-950 rounded-sm inline flex-none font-medium leading-tight max-w-full whitespace-normal break-normal");
				}
			}
		});

		return (
			<code
				{...rest}
				ref={setChildRef}
				class={twMerge(inlineCodeClass(), local.class, local.className)}
			>
				{local.children}
			</code>
		);
	},

	response: (props: ParentProps) => {
		return <span>{props.children}</span>;
	},
	void: (props: ParentProps) => {
		return <span>{props.children}</span>;
	},
	unknown: (props: ParentProps) => {
		return <span>{props.children}</span>;
	},

	QuickLinks: (props: QuickLinksProps) => (
		<QuickLinks {...props}>{props.children}</QuickLinks>
	),

	Emph: (props: EmphProps) => <Emph type={props.type}>{props.children}</Emph>,

	Reveal: (props: ParentProps) => <Reveal>{props.children}</Reveal>,

	Update: (props: ParentProps & { date?: string }) => {
		return (
			<div class="my-8 border-l-[3px] border-sprout-400 bg-sprout-50/40 dark:bg-sprout-900/10 pl-5 pr-4 py-3 rounded-r-md">
				<div class="flex items-center gap-1.5 mb-1.5">
					<div class="i-ri:quill-pen-line text-sprout-500 text-[15px]" />
					<span class="font-mono text-[11px] text-sprout-600 font-bold tracking-widest uppercase">
						Update
					</span>
					<Show when={props.date}>
						<span class="text-sprout-300 text-[10px] mx-1.5">•</span>
						<span class="font-mono text-[11.5px] text-ink-soft tracking-wide">
							{props.date}
						</span>
					</Show>
				</div>
				<div class="text-[14.5px] leading-relaxed text-ink/90 prose-p:my-1.5 prose-a:text-sprout-600">
					{props.children}
				</div>
			</div>
		);
	},

	C: (props: ParentProps) => (
		<span
			class="inline-flex px-0.5"
			title={children(() => props.children)()?.toString()}
			style={{ cursor: "help" }}
		>
			<span class="-translate-y-1/8 items-center flex justify-center bg-[#DA9F6D] w-4 h-4 rounded-full text-[10px] font-extrabold text-white select-none">
				注
				<span class="sr-only">comment</span>
			</span>
		</span>
	),

	h1: (props: ParentProps) => (
		<div>
			<h1 {...props} class="prose-h1 flex justify-start items-center font-sans">
				<div class="rounded-full bg-sprout-400 w-1.5 h-8 mr-3 shadow-sm" />
				{props.children}
			</h1>
		</div>
	),
	h2: (props: ParentProps) => {
		return (
			<>
				<h2 {...props} class="prose-h2 flex justify-start items-center font-serif-cjk">
					<div class="rounded-full bg-sprout-400 w-1 h-6 mr-2.5 shadow-sm" />
					{props.children}
				</h2>
			</>
		);
	},
	h3: (props: ParentProps) => {
		return (
			<h3 {...props} class="prose-h3 flex justify-start items-center font-serif-cjk">
				<div class="rounded-full bg-sprout-300 w-1 h-5 mr-2 mb-px shadow-sm" />
				{props.children}
			</h3>
		);
	},
	h4: (props: ParentProps) => {
		return (
			<h4 {...props} class="prose-h4 flex justify-start items-center font-serif-cjk">
				<div class="rounded-full bg-sprout-200 w-1 h-4 mr-2 mb-px shadow-sm" />
				{props.children}
			</h4>
		);
	},
	h5: (props: ParentProps) => {
		return (
			<h5 {...props} class="prose-h5 flex justify-start items-center my-1 font-sans">
				<div class="px-2 py-2 mr-1 rounded-sm border border-2 border-sprout-200 shadow-md" />
				{props.children}
			</h5>
		);
	},
	h6: (props: ParentProps) => (
		<h6 {...props} class="prose-h6 flex justify-start items-center my-1 font-sans">
			<div class="px-1.5 py-1.5 mr-1 rounded-sm border border-2 border-sprout-200 shadow-md" />
			{props.children}
		</h6>
	),
	blockquote: (props: ParentProps) => (
		<blockquote class="my-7 border-l-2 border-sprout-300 pl-4.5 py-1 font-serif-cjk italic text-ink-soft text-[15px] leading-relaxed">
			{props.children}
		</blockquote>
	),

	a: cstomLink,
	strong: (props: ParentProps) => <strong class="font-bold" {...props} />,

	img: imgContent,
	table: (props: ParentProps) => <table>{props.children}</table>,
	li: (props: ParentProps) => (
		<li {...props} class="mb-2 marker:text-sprout-400 whitespace-normal break-words">
			{props.children}
		</li>
	),
	ul: (props: ParentProps) => (
		<ul
			{...props}
			class="pl-6 mb-2 list-disc decoration-sprout-300 marker:text-sprout-400 prose max-w-full mx-4"
		>
			{props.children}
		</ul>
	),
	ol: (props: ParentProps) => (
		<ol {...props}
			class="pl-6 mb-2 list-decimal decoration-sprout-300 marker:text-sprout-400 prose max-w-full mx-4">
			{props.children}
		</ol>
	),
};

export default components;
