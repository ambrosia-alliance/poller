export type ISO8601Extended = `${number}${number}${number}${number}-${number}${number}-${number}${number}`

export function toISO8601Extended(date: Date): ISO8601Extended {
    return date.toISOString().split('T')[0] as ISO8601Extended;
}