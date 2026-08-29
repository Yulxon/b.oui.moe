import { children, createSignal, onMount, type ParentProps } from "solid-js";

const Reveal = (props: ParentProps) => {
	const [output, setOutput] = createSignal("");
	const theLetters = "abcdefghijklmnopqrstuvwxyz#%&^+=-"; // Letters to cycle through
	const ctnt = children(() => props.children)()?.toString() || "None";
	const speed = 20; // ms per frame
	const increment = 6; // frames per step. Must be >2

	let si = 0;
	let stri = 0;
	let block = "";
	let fixed = "";
	const clen = ctnt.length;

	const nextFrame = () => {
		for (let i = 0; i < clen - stri; i++) {
			const num = Math.floor(theLetters.length * Math.random());
			const letter = theLetters.charAt(num);
			block += letter;
		}

		if (si === increment - 1) {
			stri++;
		}

		if (si === increment) {
			fixed += ctnt.charAt(stri - 1);
			si = 0;
		}

		setOutput(fixed + block);
		block = "";
	};

	const rustle = (i: number) => {
		if (i > 0) {
			setTimeout(() => {
				rustle(i - 1);
				nextFrame();
				si += 1;
			}, speed);
		}
	};

	onMount(() => {
		rustle(clen * increment + 1);
	});

	return <>{output() ? output() : "\u00A0"}</>;
};

export default Reveal;
