import { createPopper, Instance as PopperInstance } from "@popperjs/core";
import { getTorrentMeta } from "../API/TorrentMetadata"
import { Config } from "../Storage/api";
import { Module } from "./index";
import jQ from "jquery";


const getId = (a: HTMLAnchorElement): string | undefined => {
    return a.href.match(/(https?:\/\/.*?view\/\d+)/)?.[1]
}


class Tooliper implements Module {
    id = "tooltips";
    shouldRun: RegExp = /((p|q|s|o)=)|(user\/)|(\.si\/?)$/;
    injectWithConfig = true;

    async inject(config?: Config) {
        if (config == undefined) return;
        const selector = "body > div > div.table-responsive > table > tbody"

        var timeout: number
        var popper: PopperInstance
        var currentToolTip: HTMLElement

        jQ(selector).on('mousemove', (event) => {
            if (timeout !== undefined) {
                window.clearTimeout(timeout);
            }
            timeout = window.setTimeout(function () {
                // trigger the new event on event.target, so that it can bubble appropriately
                jQ(event.target).trigger('mousemoveend');
            }, 100);
        });

        jQ(".container").on("mouseleave", () => {
            if (typeof popper !== 'undefined') popper.destroy()
            if (typeof currentToolTip !== 'undefined') currentToolTip.remove()
        })


        var torrentTooltips = new Map<string, string>()

        jQ(selector + ` a[href*="/view/"]`).on( "mousemoveend", async (e) => {
            // Remove previous tooltip
            if (typeof popper !== 'undefined') popper.destroy()
            if (typeof currentToolTip !== 'undefined') currentToolTip.remove()


            const torrentId = getId((e.target as HTMLAnchorElement))

            if (torrentId) {
                if (!torrentTooltips.has(torrentId)) {
                    const meta = await getTorrentMeta(torrentId)
                    if (meta) {
                        // TODO(Arjix): Generate the tooltip html using the above `meta`.
                        torrentTooltips.set(torrentId, `${meta.title}!`)
                    }
                }

                if (torrentTooltips.has(torrentId)) {
                    // In case the above if statement failed to add the tooltip to the Map.
                    currentToolTip = document.createElement("div")
                    jQ(currentToolTip).text(torrentTooltips.get(torrentId)!)
                    currentToolTip.style.position = "absolute";
                    currentToolTip.style.zIndex = "999"
                    e.target.parentElement!.prepend(currentToolTip)
                    popper = createPopper(e.target.parentElement!, currentToolTip)
                }
            }
        });
    }
}

export default Tooliper;
