import {europePmcChannel, Poller} from "@/services/poller";

(async function main() {
    const poller = new Poller([
        europePmcChannel(1, "therapeutic plasma exchange", ['2024-10-19', '2025-10-19'])
    ]);
    await poller.run();
})()

