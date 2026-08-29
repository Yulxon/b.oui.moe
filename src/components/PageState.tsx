import { type SetStoreFunction, createStore } from "solid-js/store";
import { createContext, type ParentProps, useContext } from "solid-js";
import { Bi } from "./Taxo";

function usePageState() {
	return useContext(PageStateContext);
}

function useTaxoJumpState() {
	return useContext(TaxoJumpStateContext);
}
function useTaxoTypeState() {
	return useContext(TaxoTypeStateContext);
}

type TaxoJumpStateStore = {
	id: string | undefined;
};

type TaxoTypeStateStore = {
	type: Bi;
	extra: string | undefined // set focus tag
}

const INITIAL_JUMP_STATE_STORE = { id: undefined };

const TaxoJumpStateContext = createContext<{
	taxoJump: TaxoJumpStateStore;
	setTaxoJump: SetStoreFunction<TaxoJumpStateStore>;
}>({
	taxoJump: INITIAL_JUMP_STATE_STORE,
	setTaxoJump: () => { },
});
const TaxoJumpStateProvider = (props: ParentProps) => {
	const [taxoJump, setTaxoJump] =
		createStore<TaxoJumpStateStore>(INITIAL_JUMP_STATE_STORE);

	return (
		<TaxoJumpStateContext.Provider
			value={{
				taxoJump: taxoJump,
				setTaxoJump: setTaxoJump,
			}}
		>
			{props.children}
		</TaxoJumpStateContext.Provider>
	);
};

const INITIAL_TAXO_TYPE_STATE_STORE = { type: 1, extra: undefined };

const TaxoTypeStateContext = createContext<{
	taxoType: TaxoTypeStateStore;
	setTaxoType: SetStoreFunction<TaxoTypeStateStore>;
}>({
	taxoType: INITIAL_TAXO_TYPE_STATE_STORE,
	setTaxoType: () => { },
});

const TaxoTypeStateProvider = (props: ParentProps) => {
	const [taxoType, setTaxoType] =
		createStore<TaxoTypeStateStore>({ type: Bi.cat, extra: undefined });

	return (
		<TaxoTypeStateContext.Provider
			value={{
				taxoType: taxoType,
				setTaxoType: setTaxoType,
			}}
		>
			{props.children}
		</TaxoTypeStateContext.Provider>
	);
};

type PageStateStore = {
	sections: ParentSection[];
	path: string;
};
type ParentSection = {
	text: string | undefined;
	id: string;
	level: number;
	children: ChildSection[] | [];
};
type ChildSection = {
	// 2 level of child
	children: ChildSection[] | [];
	text: string | undefined;
	id: string;
	level: number;
};
const INITIAL_PAGE_STATE_STORE = {
	sections: [],
	path: "",
};

const PageStateContext = createContext<{
	pageSections: PageStateStore;
	setPageSections: SetStoreFunction<PageStateStore>;
}>({
	pageSections: INITIAL_PAGE_STATE_STORE,
	setPageSections: () => { },
});
const PageStateProvider = (props: ParentProps) => {
	const [pageSections, setPageSections] = createStore<PageStateStore>(
		INITIAL_PAGE_STATE_STORE,
	);

	return (
		<PageStateContext.Provider
			value={{
				pageSections,
				setPageSections,
			}}
		>
			{props.children}
		</PageStateContext.Provider>
	);
};

export {
	PageStateProvider,
	usePageState,
	TaxoJumpStateProvider,
	useTaxoJumpState,
	TaxoTypeStateProvider,
	useTaxoTypeState
};
