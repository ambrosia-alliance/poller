export {europePmcChannel} from "@/services/poller/channels/europe_pmc";

import axios from "axios";
import type { PollerChannel } from "@/services/poller/channels/channel";

export class Poller {
    running: boolean = false;
    constructor(
        private readonly channels: PollerChannel[]
    ) {}

    async run() {
        if(this.running) return;
        this.running = true;
        await this.poll();
    }

    private async poll() {
        for (const chan of this.channels) {
            const resp = await axios.get(chan.url);
            if (resp.status !== 200) {
                console.error(`request to ${chan.title} failed with status code ${resp.status}`);
            }
            await chan.responseHandler(resp.data);
        }
    }
}