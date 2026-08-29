import type { Component } from "solid-js";
import cfg from "../constant";
import FooterGlow from "./FooterGlow";

const Footer: Component = () => {
	return (
		<div class="w-full relative flex flex-col">
			<div
				class="w-full font-mono flex items-center justify-between px-5 py-3"
				style={{ "font-size": "10px", color: "#8b8b86", transform: "translateY(var(--glow-push, 0px))", "will-change": "transform" }}
			>
				<span class="flex items-center gap-1.25">
					<div style={{
						width: "5px", height: "5px",
						"border-radius": "50%",
						background: "#8dab70",
					}} />
					<span>operational</span>
				</span>
				<span>©{new Date().getFullYear()} {cfg.author}</span>
			</div>
			<div class="absolute w-full left-0" style={{ top: '100%' }}>
				<FooterGlow />
			</div>
		</div>
	);
};
export default Footer;
