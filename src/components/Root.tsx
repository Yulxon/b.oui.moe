import { Link, Meta, Title } from "@solidjs/meta";
import type { Component } from "solid-js";
import cfg from "../constant";
import { Arti } from "./Arti";

const websiteJsonLd = JSON.stringify({
	"@context": "https://schema.org",
	"@type": "WebSite",
	name: cfg.title,
	url: cfg.base_url,
	description: cfg.description,
	author: {
		"@type": "Person",
		name: cfg.author,
	},
});

const Root: Component = () => {
	const currentUrl = cfg.base_url;
	return (
		<div class="flex flex-col space-y-6 2xl:space-y-8 w-full mx-auto mt-14 md:my-6 md:mt-14 grow max-w-screen">
			<Title>序 - {cfg.title}</Title>
			<Link rel="canonical" href={currentUrl} />
			<Meta property="og:type" content="website" />
			<Meta property="og:url" content={currentUrl} />
			<Meta property="og:title" content={cfg.title} />
			<Meta property="og:description" content={cfg.description} />
			<Meta name="description" content={cfg.description} />
			<Meta name="author" content={cfg.author} />
			<Meta name="twitter:card" content="summary" />
			<Meta name="twitter:title" content={cfg.title} />
			<Meta name="twitter:description" content={cfg.description} />
			<script type="application/ld+json" innerHTML={websiteJsonLd} />
			<Arti />
		</div>
	);
};

export default Root;
