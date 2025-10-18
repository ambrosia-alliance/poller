import {europePmcChannel, Poller} from "@/services/poller";

(async function main() {
    const poller = new Poller([
        europePmcChannel(1, "therapeutic plasma exchange")
    ]);
    await poller.run();
})()

