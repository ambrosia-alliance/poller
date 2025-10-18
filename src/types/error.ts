export function isError<T>(x: T | Error): x is Error {
    return x instanceof Error;
}