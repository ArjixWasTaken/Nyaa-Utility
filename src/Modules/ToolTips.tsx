import { createPopper, Instance as PopperInstance } from "@popperjs/core";
import { getTorrentMeta, NyaaTorrent } from "../API/TorrentMetadata"
import { Config } from "../Storage/api";
import { Module } from "./index";
import showdown from "showdown"
import jQ from "jquery";

const getId = (a: HTMLAnchorElement): string | undefined => {
    return a.href.match(/view\/(\d+)/)?.[1]
}

class Tooliper implements Module {
    id = "tooltips";
    shouldRun: RegExp = /((p|q|s|o)=)|(user\/)|(\.si\/?)$/;
    injectWithConfig = true;

    async inject(config?: Config) {
        if (config == undefined) return;

        var torrentTooltips = new Map<string, NyaaTorrent>()
        var toolTipLoaded = false

        const selector = "div.table-responsive > table > tbody"
        const markdownConverter = new showdown.Converter({
            tables: true, strikethrough: true,
            ghCodeBlocks: true, openLinksInNewWindow: true,
            literalMidWordUnderscores: true, simplifiedAutoLink: true,
            parseImgDimensions: true
        })

        var timeout: number
        var popper: PopperInstance
        var currentToolTip: HTMLIFrameElement = document.createElement("iframe")
        var tooltipDOM: Document
        currentToolTip.srcdoc = await (await fetch(chrome.runtime.getURL("assets/tooltip.html"))).text()
        jQ(currentToolTip).css("position", "absolute")
            .css("zIndex", "999")
            .css("width", "auto")
            .css("height", "auto")
            .css("min-width", "40%")
            .css("min-height", "40%")
            .css("max-width", "50%")
            .css("max-height", "60%")
            .css("white-space", "normal")
            .css("display", "none")

        document.body.querySelector(".table-responsive > table")?.prepend(currentToolTip)


        currentToolTip.onload = () => {
            if (!toolTipLoaded) toolTipLoaded = true
            else return

            tooltipDOM = currentToolTip.contentWindow!.document

            jQ(selector + ` td > a[href*="/view/"]:last-of-type`).on( "mousemoveend", async (e) => {
                // Remove previous tooltip
                if (typeof popper !== 'undefined') popper.destroy()
                jQ(currentToolTip).css("display", "none")
    
                const torrentId = getId((e.target as HTMLAnchorElement))
    
                if (torrentId) {
                    if (!torrentTooltips.has(torrentId)) {
                        const meta = await getTorrentMeta(`https://${window.location.hostname}/view/${torrentId}`)
                        if (meta) {
                            const tr = e.target.parentElement!.parentElement!
                            const date = (tr.querySelector(".text-center:nth-child(5)") as HTMLElement).innerText
                            const seeds = (tr.querySelector(".text-center:nth-child(6)") as HTMLElement).innerText
                            const leeches = (tr.querySelector(".text-center:nth-child(7)") as HTMLElement).innerText
                            const completed = (tr.querySelector(".text-center:nth-child(8)") as HTMLElement).innerText;

                            torrentTooltips.set(torrentId, {
                                ...meta,
                                date,
                                seeds,
                                leeches,
                                completed
                            });
                        }
                    }

                    if (torrentTooltips.has(torrentId)) {
                        // In case the above if statement failed to add the tooltip to the Map.
                        const meta = torrentTooltips.get(torrentId)!;

                        jQ(tooltipDOM.querySelector(".panel-title") as HTMLElement).text(meta.title)
                        jQ(tooltipDOM.querySelector("#torrentAuthorAnchor") as HTMLElement)
                          .attr("href", meta.author ? `https://${window.location.hostname}${meta.author}` : "")
                          .text(meta.author ?  meta.author.match(/user\/(.*)\/?/)![1] : "Anonymous")

                        jQ(tooltipDOM).find("#torrentInfoHash").first().text(meta.hash!)
                        jQ(tooltipDOM).find("#torrent-description").first().html(markdownConverter.makeHtml(meta.description))
                        jQ(tooltipDOM).find("#comments h3").first().text(`Comments - ${meta.comments.length}`)

                        jQ(tooltipDOM).find("#collapse-comments > div").remove()

                        meta.comments.forEach((comment, index) => {
                            const commentNode = tooltipDOM.querySelector("template")!.content.cloneNode(true)
                            jQ(commentNode).find("div").first().attr("id", `com-${index+1}`)

                            jQ(commentNode).find("a").first()
                              .attr("href", comment.author ? `https://${window.location.hostname}/user/${comment.author}` : "")
                              .text(comment.author!)

                            jQ(commentNode).find("img").first().attr("src", comment.avatar!)
                            jQ(commentNode).find(".comment-details > a").first().attr("href", `com-${index+1}`)
                              .find("small").text(new Date(parseFloat(comment.date + "") * 1000).toLocaleDateString()).attr("data-timestamp", comment.date!)
                            jQ(commentNode).find(".comment-content").html(markdownConverter.makeHtml(comment.content))

                            tooltipDOM.querySelector("#collapse-comments")?.appendChild((commentNode as HTMLElement).querySelector("div")!)
                        })

                        popper = createPopper(e.target.parentElement!, currentToolTip)
                        jQ(currentToolTip).css("display", "")
                    }
                }
            });
        }

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
            currentToolTip.style.display = "none"
            if (typeof popper !== 'undefined') popper.destroy()
        })
    }
}

export default Tooliper;