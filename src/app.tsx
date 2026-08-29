import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { MetaProvider } from "@solidjs/meta";
import { createEffect, ErrorBoundary, onMount, Suspense, lazy } from "solid-js";
import { MDXProvider } from "solid-mdx";
import Mdx from "./components/Mdx";
import "./style.css";
import IErr from "./components/IErr";
import NotFound from "./components/NotFound";
import { PageStateProvider, TaxoJumpStateProvider, TaxoTypeStateProvider } from "./components/PageState";
import "virtual:uno.css";
import "@unocss/reset/tailwind-compat.css";

const Header = lazy(() => import("./components/Header"));
const Footer = lazy(() => import("./components/Footer"));
const BackTopBtn = lazy(() => import("./components/BackTopBtn"));

export default function App() {

	createEffect(() => {
		if ("paintWorklet" in CSS) {
			(CSS as unknown as { paintWorklet: { addModule: (s: string) => void } }).paintWorklet.addModule("/houdini-paint.js");
		}
	});

	onMount(() => {
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "visible") {
				navigator.wakeLock.request("screen");
			}
		});
	});

	return (
		<MetaProvider>
			<TaxoTypeStateProvider>
				<Router
					root={(props) => (
						<PageStateProvider>
						<TaxoJumpStateProvider>
							<main>
								<ErrorBoundary
									fallback={(e) =>
										e.message === "404" ? <NotFound /> : <IErr>{e.message}</IErr>
									}
								>
									<MDXProvider components={Mdx}>
										<div class="flex flex-col bg-[#fbfaf6] dark:bg-[#171717] min-h-screen grow items-center">
											<Suspense fallback={<div class="h-16" />}>
												<Header />
											</Suspense>
											<div class="flex flex-col flex-1 grow pb-12 w-11/12 md:w-full">
												<Suspense>{props.children}</Suspense>
											</div>
											<Suspense>
												<Footer />
											</Suspense>
										</div>
										<Suspense>
											<BackTopBtn />
										</Suspense>
									</MDXProvider>
								</ErrorBoundary>
							</main>
						</TaxoJumpStateProvider>
					</PageStateProvider>
				)}
			>
				<FileRoutes />
			</Router>
		</TaxoTypeStateProvider>
		</MetaProvider>
	);
}
