export const isObject = (x: unknown): x is Record<string, unknown> =>
    typeof x === "object" && x !== null;

export const isNumber = (x: unknown): x is string =>
    typeof x === "number";

export const isNonEmptyString = (x: unknown): x is string =>
    typeof x === "string" && x.trim().length > 0;

export const isStringArray = (x: unknown): x is string[] =>
    Array.isArray(x) && x.every(v => typeof v === "string");

export const isArray = <T>(
    x: unknown,
    predicate?: (v: unknown) => v is T
): x is T[] =>
    Array.isArray(x) && (predicate ? x.every(predicate) : true);