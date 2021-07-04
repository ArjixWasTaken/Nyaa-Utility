if (window.location.href.includes("/notifications")) {
    const container = document.querySelector("body > div.container");

    container.removeChild(container.querySelector("h1"));
    container.removeChild(container.querySelector("p"));

    document.querySelector("title").innerText = "Notifications :: Nyaa";
}

nyaaUtility.storage.system.onload(async () => {
    if (window.location.href.includes("/notifications")) {
        document.head.appendChild(
            nyaaUtility.utils.createElement("style", {
                innerHTML: `
                .notif-green {
                    color: green;
                }
                .notif-red {
                    color: red;
                }
            `,
            })
        );

        const container = document.querySelector("body > div.container");
        container.appendChild(
            nyaaUtility.utils.createElement("center", {
                innerHTML: `
            <p>Hint: Double click on a notification to remove it!</p>
            `,
            })
        );

        container.appendChild(
            nyaaUtility.utils.createElement("table", {
                className:
                    "table table-bordered table-hover table-striped torrent-list",
                innerHTML: `
                <thead>
					<tr>
						<th class="hdr-category text-center" style="width:80px;">Category</th>
						<th class="hdr-name" style="width:auto;">Name</th>
						<th class="hdr-name" style="width:100px;">Comments</th>
						<th class="hdr-size sorting text-center" style="width:100px;"><a href="/notifications?s=size&amp;o=desc"></a>Size</th>
						<th class="hdr-date sorting_desc text-center" title="In local time" style="width:140px;"><a href="/notifications?s=id&amp;o=asc"></a>Date</th>
					</tr>
				</thead>
                <tbody id="notifications-body"></tbody>
            `,
            })
        );
        const notificationsTable =
            document.getElementById("notifications-body");

        //prettier-ignore
        for (let [id, notif] of Object.entries(nyaaUtility.storage.user.options.notifications)) {
            const tr = nyaaUtility.utils.createElement("tr", {
                className: "default",
                innerHTML: `
                    <td>
                        <a href="/?c=${notif.category}" title="Anime - Raw">
                            <img src="/static/img/icons/nyaa/${notif.category}.png" alt="Anime - Raw" class="category-icon">
                        </a>
                    </td>
                    <td>
                        <a href="/view/${notif.id}" title="${notif.title}">${notif.title}</a>
                    </td>
                    <td><span class="notif-${notif.mode == "addition" ? "green" : "red"}">&nbsp;&nbsp;${notif.mode == "addition" ? "+" : "-"}${notif.count}</span> &nbsp;(${notif.comments})</td>
                    <td class="text-center">6.5 GiB</td>
                    <td class="text-center" data-timestamp="1625397940" title="5 minutes 40 seconds ago">2021-07-04 14:25</td>
                `,
            });
            tr.addEventListener("dblclick", () => {
                tr.remove()
                delete nyaaUtility.storage.user.options.notifications[id]
                nyaaUtility.settings.save()
            });

            notificationsTable.appendChild(tr);
        }
    }
});
