(async function () {
    const notifications = Object.entries(
        nyaaUtility.storage.user.options.notifications
    );
    const currentId = parseInt(window.location.href.match(/view\/(\d+)/)[1]);
    const ops = nyaaUtility.storage.user.options;

    loop1: for (let [id, notif] of notifications) {
        if (Array.isArray(notif)) {
            for (const item of notif) {
                if (currentId == item.id && Object(ops.notifications).hasOwnProperty(notif.id)) {
                    ops.notifications[notif.id] = ops.notifications[
                        notif.id
                    ].filter((it) => item.id != it.id);

                    if (ops.notifications[id].length == 0)
                        delete ops.notifications[id];
                    nyaaUtility.storage.user.options = ops;
                    await nyaaUtility.settings.save();
                    break loop1;
                }
            }
            continue;
        }

        if (currentId == notif.id) {
            delete nyaaUtility.storage.user.options.notifications[notif.id];
            await nyaaUtility.settings.save();
            break loop1;
        }
    }
})();
