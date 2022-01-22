import { createPopper, Instance as PopperInstance } from "@popperjs/core";
import { getTorrentMeta } from "../API/TorrentMetadata"
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
        const selector = "div.table-responsive > table > tbody"
        const markdownConverter = new showdown.Converter()

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
                    const meta = await getTorrentMeta(`https://${window.location.hostname}/view/${torrentId}`)
                    if (meta) {
                        const tr = e.target.parentElement!.parentElement!
                        const date = (tr.querySelector(".text-center:nth-child(5)") as HTMLElement).innerText
                        const seeds = (tr.querySelector(".text-center:nth-child(6)") as HTMLElement).innerText
                        const leeches = (tr.querySelector(".text-center:nth-child(7)") as HTMLElement).innerText
                        const completed = (tr.querySelector(".text-center:nth-child(8)") as HTMLElement).innerText

                        let comments = ""

                        meta.comments.forEach((comment, index) => {
                            console.log(comment, index)
                            comments += commentTemplateHTML
                              .replace("{COMMENT_INDEX}", (index+1) + "")
                              .replace("{COMMENT_AVATAR}", comment.avatar ?? "")
                              .replace("{COMMENT_AUTHOR_LINK}", comment.author ? `https://${window.location.hostname}${comment.author}` : "")
                              .replace("{COMMENT_AUTHOR}", comment.author ?? "")
                              .replace("{COMMENT_TIMESTAMP}", comment.date + "")
                              .replace("{COMMENT_DATE}", new Date(parseFloat(comment.date + "") * 1000).toLocaleDateString())
                              .replace("{COMMENT_CONTENT}", markdownConverter.makeHtml(comment.content))
                        })


                        console.log(meta)
                        const html = templateHTML
                          .replace("{TORRENT_SUBMITTER_NAME}", meta.author ?  meta.author.match(/user\/(.*)\/?/)![1] : "Anonymous")
                          .replace("{TORRENT_SUBMITTER_LINK}", meta.author ? `https://${window.location.hostname}${meta.author}` : "")
                          .replace("{TORRENT_TITLE}", meta.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'))
                          .replace("{TORRENT_DATE}", meta.date ?? "")
                          .replace("{TORRENT_DATE_LOCAL}", date)
                          .replace("{TORRENT_SIZE}", meta.filesize ?? "")
                          .replace("{TORRENT_HASH}", meta.hash ?? "NaN")
                          .replace("{TORRENT_FILE}", `https://${window.location.hostname}${meta.torrentFile}`)
                          .replace("{TORRENT_MAGNET}", meta.magnet ?? "")
                          .replace("{TORRENT_COMPLETED}", completed)
                          .replace("{TORRENT_SEEDERS}", seeds)
                          .replace("{TORRENT_LEECHERS}", leeches)
                          .replace("{TORRENT_ID}", meta.id)
                          .replace("{COMMENTS_COUNT}", meta.comments.length.toString())
                          .replace("{DESCRIPTION}", markdownConverter.makeHtml(meta.description))
                          .replace("{COMMENTS_HTML}", comments)
                        torrentTooltips.set(torrentId, html)
                    }
                }

                if (torrentTooltips.has(torrentId)) {
                    // In case the above if statement failed to add the tooltip to the Map.
                    currentToolTip = document.createElement("div")
                    jQ(currentToolTip).html(torrentTooltips.get(torrentId)!)
                    currentToolTip.style.position = "absolute";
                    currentToolTip.style.zIndex = "999"
                    currentToolTip.style.width = "53.1%"
                    currentToolTip.style.whiteSpace = "normal"
                    e.target.parentElement!.prepend(currentToolTip)
                    popper = createPopper(e.target.parentElement!, currentToolTip)
                }
            }
        });
    }
}

export default Tooliper;


const templateHTML = `
<div style="margin-bottom: 0px;">
    <div class="panel panel-default" style="margin-bottom: 0px;">
        <div class="panel-heading">
            <h3 class="panel-title">{TORRENT_TITLE}</h3>
        </div>
        <div class="panel-body" style="white-space: nowrap;">
            <div class="row">
                <div class="col-md-1">Submitter:</div>
                <div class="col-md-5">
                    <a class="text-default" href="{TORRENT_SUBMITTER_LINK}" data-toggle="tooltip" title="User">{TORRENT_SUBMITTER_NAME}</a>
                </div>

                <div class="col-md-1"></div>
                <div class="col-md-5"></div>
            </div>

            <div class="row">
                <div class="col-md-1">File size:</div>
                <div class="col-md-5">{TORRENT_SIZE}</div>

                <div class="col-md-1">Seeders:</div>
                <div class="col-md-5">
                    <span style="color: green">{TORRENT_SEEDERS}</span>
                </div>
            </div>

            <div class="row">
                <div class="col-md-1">Date:</div>
                <div class="col-md-5" data-timestamp="{TORRENT_DATE}">
                    {TORRENT_DATE_LOCAL}
                </div>

                <div class="col-md-1">Leechers:</div>
                <div class="col-md-5">
                    <span style="color: red">{TORRENT_LEECHERS}</span>
                </div>

            </div>
            <div class="row">
                <div class="col-md-1">Info hash:</div>
                <div class="col-md-5">
                    <kbd>{TORRENT_HASH}</kbd>
                </div>

                <div class="col-md-1" style="transform: translateX(-10%);">Completed:</div>
                <div class="col-md-5">{TORRENT_COMPLETED}</div>
            </div>
        </div>
        <!--/.panel-body -->

        <div class="panel-footer clearfix">
            <a href="{TORRENT_FILE}"><i class="fa fa-download fa-fw"></i>Download Torrent</a>
            or
            <a href="{TORRENT_MAGNET}" class="card-footer-item"><i class="fa fa-magnet fa-fw"></i>Magnet</a>
        </div>
    </div>

    <div class="panel panel-default" style="margin-bottom: 0px;">
        <div markdown-text class="panel-body" id="torrent-description" style="max-height: 400px; overflow: auto;">
            {DESCRIPTION}
        </div>
    </div>

    <div id="comments" class="panel panel-default" style="margin-bottom: 0px;">
        <div class="panel-heading">
            <a
                class="collapsed"
                data-toggle="collapse"
                href="https://nyaa.si/view/{TORRENT_ID}#collapse-comments"
                role="button"
                aria-expanded="false"
                aria-controls="collapse-comments">
                <h3 class="panel-title">Comments - {COMMENTS_COUNT}</h3>
            </a>
        </div>
        <div class="collapse" id="collapse-comments">
            {COMMENTS_HTML}
        </div>
    </div>
</div>
`

const commentTemplateHTML = `
<div class="panel panel-default comment-panel" id="com-{COMMENT_INDEX}">
		<div class="panel-body">
			<div class="col-md-2">
				<p>
					<a class="text-default" href="{COMMENT_AUTHOR_LINK}" data-toggle="tooltip" title="User" style="float: left; padding-right: 10%;">{COMMENT_AUTHOR}</a>
				</p>
				<img class="avatar" src="{COMMENT_AVATAR}" alt="User">
			</div>
			<div class="col-md-10 comment">
				<div class="row comment-details">
					<a href="#com-{COMMENT_INDEX}">
                        <small data-timestamp-swap="" data-timestamp="{COMMENT_TIMESTAMP}">{COMMENT_DATE}</small>
                    </a>
				</div>
				<div class="row comment-body">
					<div markdown-text class="comment-content">
                        {COMMENT_CONTENT}
                    </div>
				</div>
			</div>
		</div>
	</div>
`