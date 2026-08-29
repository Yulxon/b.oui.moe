import { lazy, Suspense } from "solid-js";
import Me from "./Me";
import Spinner from "~/components/Spinner";

export default () => (
	<Suspense fallback={<Spinner />}>
		<Me />
	</Suspense>
);
