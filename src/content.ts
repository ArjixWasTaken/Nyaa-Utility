import Logger from "./utils/Logger";
import { allModules } from "./Modules";
import { config } from "./storage";

config.liveSync();
const logger = new Logger("Page");

// TODO: Actually implement a menu to enable/disable modules.
const enabledModules: String[] = allModules.map(mod => mod.id)

const waitForElem = (selector: string, callback: (elem: Element) => void) => {
    let found = false
    let elem = document.querySelector(selector)
    const interval = setInterval(() => {
        elem = document.querySelector(selector)
        if (!found && elem != null) {
            found = true
            callback(elem)
            clearInterval(interval)
        }
    }, 200)
}

allModules.forEach(module => {
    try {
        if (enabledModules.includes(module.id) && module.shouldRun.test(window.location.pathname)) {
            if (module.injectCss) {
                waitForElem("head", (head) => {
                    head.querySelector(`#nyaa-util-module-${module.id}`)?.remove();

                    if (module.injectCss instanceof URL) {
                        fetch(module.injectCss.toString())
                            .then(res => res.text())
                            .then(css => {
                                head.appendChild(Object.assign(document.createElement("style"), {
                                    innerHTML: css,
                                    type: "text/css",
                                    id: `nyaa-util-module-${module.id}`
                                }));
                            })
                    } else {
                        head.appendChild(Object.assign(document.createElement("style"), {
                            innerHTML: module.injectCss,
                            type: "text/css",
                            id: `nyaa-util-module-${module.id}`
                        }));
                    }
                })
            }

            if (module.injectWithConfig) {
                config.onload(() => {
                    module.inject(config)
                    logger.info(`Loaded '${module.id}'`)
                })
                return;
            }

            // Asynchronously inject the module
            (async () => { module.inject(config); logger.info(`Loaded '${module.id}'`) })();
        }
    } catch (error) {
        logger.error(`Error loading module '${module.id}'`, error)
    }
});
