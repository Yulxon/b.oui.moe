import { createSignal, onMount, type JSXElement, type ParentComponent } from "solid-js";

import { Dynamic } from "solid-js/web";
import { twMerge } from "tailwind-merge";

export const isExternalURL = (url: string) =>
	url.startsWith("https:") || url.startsWith("mailto:");

export type QuickLinksProps = {
	title: string;
	href: string;
	icon: () => JSXElement;
	description?: string;
	children?: JSXElement;
};

export const QuickLinks: ParentComponent<QuickLinksProps> = (props) => {
	return (
		<div class="group relative not-prose rounded-xl">
			<div class="absolute -inset-px rounded-xl bg-gradient-to-br from-[#f1f1f1] to-[#fbfbfb]
    shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1),0_20px_40px_-15px_rgba(0,0,0,0.05)]
    border border-gray-200/50
    ring-1 ring-white inset
    transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
    hover:scale-105 hover:-translate-y-2
    hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)]" />

			<div class="relative overflow-hidden h-full w-full grow">
				<a onClick={() => window.open(props.href)} class="hover:cursor-pointer" target="_blank">
					<span class="absolute -inset-px rounded-xl" />
				</a>

				<div class="flex items-center justify-center m-4">
					<Dynamic component={props.icon} />

					<p
						class={twMerge(
							"overflow-hidden whitespace-nowrap w-0",
							"bg-gradient-to-br from-sprout-400 to-sprout-700 bg-clip-text",
							"pointer-events-none select-none",
							"items-center no-underline font-semibold text-lg md:text-normal text-transparent",
							"group-hover:w-24 flex justify-center transition-all delay-300",
						)}
					>
						{props.title}
					</p>
				</div>
			</div>
		</div>
	)
};
