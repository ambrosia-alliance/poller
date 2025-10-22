import {europePmcChannel, Poller} from "@/services/poller";

(async function main() {
    const poller = new Poller([
        europePmcChannel(1, "therapeutic plasma exchange"),
        europePmcChannel(2, "Pulsed Electromagnetic Field (PEMF) Therapy"),
        europePmcChannel(2, "Pulsed Electromagnetic Field (PEMF) Therapy"),
        europePmcChannel(3, "Ozone Therapy (Major Autohemotherapy)"),
        europePmcChannel(4, "Methylene Blue + Near-Infrared Combination"),
        europePmcChannel(5, "Extracorporeal Shockwave Therapy"),
        europePmcChannel(6, "Autologous Stem-Cell Mobilization"),
        europePmcChannel(8, "Telomerase Activators"),
        europePmcChannel(9, "Advanced Glycation End-Product (AGE) Breakers"),
        europePmcChannel(10, "Photopheresis (ECP)"),
    ]);
    await poller.run();
})()
