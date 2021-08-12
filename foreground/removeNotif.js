{
    const notifications = Object.entries(
        nyaaUtility.storage.user.options.notifications
    );
    const currentId = window.location.href.match(/view\/(\d+)/)[1];
    const ops = nyaaUtility.storage.user.options;

    loop1: for (let [id, notif] of notifications) {
        if (Array.isArray(notif)) {
            for (const item of notif) {
                if (currentId == item.id) {
                    alert("removed notif");
                    ops.notifications[item.id] = ops.notifications[
                        item.id
                    ].filter((it) => item.id != it.id);

                    if (ops.notifications[id].length == 0)
                        delete ops.notifications[id];
                    nyaaUtility.storage.user.options = ops;
                    nyaaUtility.settings.save();
                    break loop1;
                }
            }
            continue;
        }

        if (currentId == notif.id) {
            alert("removed notif");
            delete nyaaUtility.storage.user.options.notifications[notif.id];
            nyaaUtility.settings.save();
            break loop1;
        }
    }
}
