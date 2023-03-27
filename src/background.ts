import browser from "webextension-polyfill";
import { allModules } from "./Modules";
import { config } from "./storage";
import Logger from "./utils/Logger";

const logger = new Logger("background");

config.liveSync()

// We can't modify the tabs before the browser has loaded,
// and for some reason the extension loads before that...
browser.runtime.onInstalled.addListener(() => {
    setTimeout(() => {
        if (import.meta.env.DEV) {
            browser.tabs.query({}).then(tabs => {
                if (!tabs.length) return;
                const tab = tabs.find(t => t?.url?.startsWith("about"));
                if (!tab) return;

                if (tab.url && !tab.url.includes("nyaa.si")) {
                    logger.debug("Redirecting to nyaa.si")
                    browser.tabs.update(tab.id, { url: "https://nyaa.si" });
                }
            })
        }
    }, 1000)
});

interface Clock {
    moduleId: string
    countdown: number
}

const Clock = {
    clocks: allModules.map(mod => {
        return mod.backgroundTaskInterval ? { moduleId: mod.id, countdown: mod.backgroundTaskInterval } : undefined
    }).filter(Boolean) as Array<Clock>,

    tick() {
        for (const clock of Clock.clocks) {
            clock.countdown -= 1
            if (clock.countdown <= 0) {
                const cb = allModules.find(i => i.id === clock.moduleId);
                if (cb && cb.backgroundTask) {
                    try {
                        cb.backgroundTask(config)
                        logger.info(`Background task for \`${cb.id}\` was ran.`)
                    } catch (e) {
                        logger.error("Failed to run background task for", cb.id, e)
                    } finally {
                        clock.countdown = cb.backgroundTaskInterval!
                    }
                }
            }
        }
    }
}


// Due to the a limitation in the alarms API, the first alarm will fire two minutes after it's set.
// But from the 2nd fire and on, it will fire every minute.
// We don't need to run a background task at an internal less than 5 minutes, so it is ok.
// Although it is annoying for the developer, since you have to wait 2 minutes for the alarm to fire.
browser.alarms.create("clock", { delayInMinutes: 1, periodInMinutes: 1 })
browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "clock") {
        Clock.tick()
    }
})
