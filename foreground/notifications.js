const categories = {
    "1_1": "Anime - Anime Music Video",
    "1_2": "Anime - English-translated",
    "1_3": "Anime - Non-English-translated",
    "1_4": "Anime - Raw",
    "2_1": "Audio - Lossless",
    "2_2": "Audio - Lossy",
    "3_1": "Literature - English-translated",
    "3_2": "Literature - Non-English-translated",
    "3_3": "Literature - Raw",
    "4_1": "Live Action - English-translated",
    "4_2": "Live Action - Idol/Promotional Video",
    "4_3": "Live Action - Non-English-translated",
    "4_4": "Live Action - Raw",
    "5_1": "Pictures - Graphics",
    "5_2": "Pictures - Photos",
    "6_1": "Software - Applications",
    "6_2": "Software - Games",
};

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
						<th class="hdr-date sorting text-center" title="In local time" style="width:140px;"><a href="/notifications?s=id&amp;o=asc"></a>Date</th>
                        <th class="hdr-date sorting text-center" title="The type of the notification." style="width:140px;">Type</th>
					</tr>
				</thead>
                <tbody id="notifications-body"></tbody>
            `,
            })
        );
        const notificationsTable =
            document.getElementById("notifications-body");

        //prettier-ignore
        const notifications = Array.from(Object.entries(nyaaUtility.storage.user.options.notifications)).reverse()
        for (let [id, notif] of notifications) {
            if (Array.isArray(notif)) {
                for (const item of notif) {
                    const tr = nyaaUtility.utils.createElement("tr", {
                        className: "default",
                        innerHTML: `
                            <td>
                                <a href="/?c=${item.category}" title="${
                            categories[item.category]
                        }">
                                    <img src="/static/img/icons/nyaa/${
                                        item.category
                                    }.png" alt="${
                            categories[item.category]
                        }" class="category-icon">
                                </a>
                            </td>
                            <td>
                                <a href="/view/${item.id}" title="${
                            item.title
                        }">${item.title}</a>
                            </td>
                            <td style="text-align: center;">${
                                item.comments
                            }</td>
                            <td class="text-center">${item.size}</td>
                            <td class="text-center" data-timestamp="${
                                item.timestamp
                            }">${(() => {
                            const d = new Date(parseInt(item.timestamp));
                            const month = (d.getMonth() - 1)
                                .toString()
                                .padStart(2, "0");
                            const day = d.getDate().toString().padStart(2, "0");
                            const year = d.getFullYear();
                            const hours = d
                                .getHours()
                                .toString()
                                .padStart(2, "0");
                            const minutes = d
                                .getMinutes()
                                .toString()
                                .padStart(2, "0");
                            return `${year}-${month}-${day} ${hours}:${minutes}`;
                        })()}</td>
                            <td style="text-align: center; color: #ADD8E6">new feed item</td>
                        `,
                    });
                    tr.addEventListener("dblclick", () => {
                        tr.remove();
                        nyaaUtility.storage.user.options.notifications[id] =
                            nyaaUtility.storage.user.options.notifications[
                                id
                            ].filter((it) => item.id != it.id);

                        if (
                            nyaaUtility.storage.user.options.notifications[id]
                                .length == 0
                        )
                            delete nyaaUtility.storage.user.options
                                .notifications[id];
                        nyaaUtility.settings.save();
                    });
                    notificationsTable.appendChild(tr);
                }
                continue;
            }
            const tr = nyaaUtility.utils.createElement("tr", {
                className: "default",
                innerHTML: `
                    <td>
                        <a href="/?c=${notif.category}" title="${
                    categories[notif.category]
                }">
                            <img src="/static/img/icons/nyaa/${
                                notif.category
                            }.png" alt="${
                    categories[notif.category]
                }" class="category-icon">
                        </a>
                    </td>
                    <td>
                        <a href="/view/${notif.id}" title="${notif.title}">${
                    notif.title
                }</a>
                    </td>
                    <td style="text-align: center;"><span class="notif-${
                        notif.mode == "addition" ? "green" : "red"
                    }">&nbsp;&nbsp;${notif.mode == "addition" ? "+" : "-"}${
                    notif.count
                }</span> &nbsp;(${notif.comments})</td>
                    <td class="text-center">${notif.size}</td>
                    <td class="text-center" data-timestamp="${
                        notif.timestamp
                    }">${(() => {
                    const d = new Date(parseInt(notif.timestamp) * 1000);
                    const month = (d.getMonth() - 1)
                        .toString()
                        .padStart(2, "0");
                    const day = d.getDate().toString().padStart(2, "0");
                    const year = d.getFullYear();
                    const hours = d.getHours().toString().padStart(2, "0");
                    const minutes = d.getMinutes().toString().padStart(2, "0");
                    return `${year}-${month}-${day} ${hours}:${minutes}`;
                })()}</td>
                    <td style="text-align: center; color: #ADD8E6">${
                        notif.type
                    }</td>
                `,
            });
            tr.addEventListener("dblclick", () => {
                tr.remove();
                delete nyaaUtility.storage.user.options.notifications[id];
                nyaaUtility.settings.save();
            });

            notificationsTable.appendChild(tr);
        }
    }
});
