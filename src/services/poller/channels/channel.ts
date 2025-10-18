export type PollerChannel = {
    url: string
    title: string
    responseHandler: (resp: unknown) => Promise<void>;
}