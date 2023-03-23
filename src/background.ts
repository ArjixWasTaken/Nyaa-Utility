import browser from "webextension-polyfill";

console.log("Hello from the background!");

browser.runtime.onInstalled.addListener((details) => {
    console.log("Extension installed:", details);
});


interface Clock {
    moduleId: string
    countdown: number
}

const Clock = {
    clocks: [{ moduleId: "test", countdown: 10 }],
    tick() {
        for (const clock of this.clocks) {
            clock.countdown -= 1;

        }
    }
}

// chrome.alarms.create(
//     name?: string,
//     alarmInfo: AlarmCreateInfo,
//     callback?: function,
//   )

browser.alarms.create("clock", { delayInMinutes: 1, periodInMinutes: 1 })
browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "clock") {
        Clock.tick()
    }
})

if (import.meta && import.meta.env && import.meta.env.DEV) {
    browser.tabs.getCurrent().then((tab) => {
        browser.tabs.update(tab.id, { url: "https://nyaa.si" });
    });
}
