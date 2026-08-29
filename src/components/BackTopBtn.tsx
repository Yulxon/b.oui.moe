import { Show, type Component } from "solid-js";
import { useWindowScrollPosition } from "@solid-primitives/scroll";
const ScrollTopBtn: Component = () => {
	const scroll = useWindowScrollPosition();
	return (
		<>
			<Show when={scroll.y > 350 && document.documentElement.clientWidth > 930}>
				<button
					onclick={() => {
						// useLenis().scrollTo(0);
						window.scrollTo({ top: 0, behavior: 'smooth' });
					}}
					class="!fixed bottom-5 right-5 p-3 mb-3 bg-sprout-200/60 hover:bg-sprout-300/75 squircle rounded-md h-9 w-9 grid items-center justify-center duration-200 h-9 xl:h-12 w-9 xl:w-12 flex"
				>
					<div class="i-ci-chevron-big-up" />
				</button>
			</Show>
		</>
	);
};

export default ScrollTopBtn;
