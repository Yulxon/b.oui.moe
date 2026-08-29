import type { JSXElement, ParentComponent, ParentProps } from "solid-js";

import { Dynamic } from "solid-js/web";
import { twMerge } from "tailwind-merge";

export const isExternalURL = (url: string) => /^https?:\/\//.test(url);

export type EmphProps = {
	type: "warn" | "info" | "tips" | "note";
	children: JSXElement;
};

const icons = {
	warn: "i-ci-triangle-warning",
	info: "i-ci-info",
	tips: "i-ci-heart-outline",
	note: "i-ci-bell",
};

export const Emph: ParentComponent<EmphProps> = (props) => {
	const styleOpts = {
		warn: {
			text: "WARNING",
			icon: () => (
				<div class={twMerge(`h-7 w-7 text-red-400`, icons[props.type])} />
			),
			border: (props: ParentProps) => (
				<div class="w-full outline-1 outline-red-300 outline-dashed rounded-md bg-[#fff1f2] p-2 sm:py-4 sm:px-6">
					{props.children}
				</div>
			),
		},
		info: {
			text: "Information",
			icon: () => (
				<div class={twMerge(`h-7 w-7 text-sprout-400`, icons[props.type])} />
			),
			border: (props: ParentProps) => (
				<div class="w-full outline-1 outline-sprout-300 outline-dashed rounded-md bg-sprout-50 p-2 sm:py-4 sm:px-6 my-2">
					{props.children}
				</div>
			),
		},
		tips: {
			text: "Tips",
			icon: () => (
				<div class={twMerge(`h-7 w-7 text-ouchi-500`, icons[props.type])} />
			),
			border: (props: ParentProps) => (
				<div class="w-full outline-1 outline-chill-300 outline-dashed rounded-md bg-chill-50 p-2 sm:py-4 sm:px-6 my-2">
					{props.children}
				</div>
			),
		},
		note: {
			text: "Notice",
			icon: () => (
				<div class={twMerge(`h-7 w-7 text-ouchi-400`, icons[props.type])} />
			),
			border: (props: ParentProps) => (
				<div class="w-full outline-1 outline-ouchi-300 outline-dashed rounded-md bg-ouchi-50 p-2 sm:py-4 sm:px-6 my-2">
					{props.children}
				</div>
			),
		},
	};

	return (
		<Dynamic component={styleOpts[props.type].border}>
			<div class="flex flex-col items-start prose flex-initial">
				<div class="flex items-center">
					<Dynamic component={styleOpts[props.type].icon} />
					<div class="text-lg text-slate-600 font-bold capitalize no-underline pl-3">
						{styleOpts[props.type].text}
					</div>
				</div>
			</div>

			<div class="flex">
				<div class="text-zinc-600">
					{props.children}
				</div>
			</div>
		</Dynamic>
	);
};
