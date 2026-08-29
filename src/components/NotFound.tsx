import { HttpStatusCode } from "@solidjs/start";

const NotFound = () => {
	return (
		<div class="flex flex-col w-full items-center justify-center h-full grow text-lg text-red-400 leading-none">
			<HttpStatusCode code={404} />
			／|、
			<br />
			(˙、．7
			<br />
			|、～ヽ
			<br />
			じしf_,)ノ
			<br />
			Page Not Found
		</div>
	);
};

export default NotFound;
