export function toQueryStr(params: Record<string, string>): string {
    return new URLSearchParams(params).toString();
}