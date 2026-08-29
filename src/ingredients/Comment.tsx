import type { ParentProps } from "solid-js";

/**
 * Lightweight tooltip without any external dependency:
 * renders the small badge and shows the comment text on hover/focus.
 */
const Comment = (props: ParentProps) => {
	const text = () => props.children?.toString() ?? "";
	return (
		<span
			class="relative inline-flex px-0.5 group"
			style={{ cursor: "help" }}
		>
			<span class="-translate-y-1/8 items-center flex justify-center bg-[#DA9F6D] w-4 h-4 rounded-full text-[10px] font-extrabold text-white select-none">
				注
				<span class="sr-only">comment</span>
			</span>
			<span
				class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block group-focus-within:block whitespace-normal rounded-md bg-[#e6e2fd] px-2 py-1 font-normal text-[14px] max-w-1/2 md:max-w-1/4 leading-tight text-zinc-700 z-50"
				role="tooltip"
			>
				{text()}
			</span>
		</span>
	);
};

export default Comment;
