import { useLocation } from "@solidjs/router";
import { Show } from "solid-js";
import Page from "~/components/Page";
import { contentMap } from "~/components/Arti";

export default function PostLayout(props: { children?: any }) {
	const location = useLocation();

	const article = () => {
		let path = location.pathname.slice(1); // remove leading slash
		if (path.endsWith("/")) {
			path = path.slice(0, -1);
		}
		return contentMap.get(path);
	};

	return (
		<Show when={article()} fallback={<div>Loading...</div>}>
			<Page article={article()}>
				{props.children}
			</Page>
		</Show>
	);
}
