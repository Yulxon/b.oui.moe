export type TupleToUnion<T> = T extends readonly (infer U)[] ? U : never;

export function isIn<T>(values: readonly T[], x: any): x is T {
	return values.includes(x);
}

export function intersect<T>(arr1: readonly T[], arr2: readonly T[]): T[] {
	return arr1.filter((item) => arr2.includes(item));
}
