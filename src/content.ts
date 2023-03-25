import Logger from "./utils/Logger";
import { allModules } from "./Modules";
import { config } from "./storage";

config.liveSync();
const logger = new Logger("Page");

// TODO: Actually implement a menu to enable/disable modules.
const enabledModules: String[] = allModules.map(mod => mod.id)

allModules.forEach(module => {
    try {
        if (enabledModules.includes(module.id) && module.shouldRun.test(window.location.href)) {
            if (module.injectWithConfig) {
                config.onload(() => {
                    module.inject(config)
                    logger.info(`Loaded '${module.id}'`)
                })
                return;
            }

            module.inject(config)
            logger.info(`Loaded '${module.id}'`)
        }
    } catch (error) {
        logger.error(`Error loading module '${module.id}'`, error)
    }
})
