import { config } from "./Storage/api"
import { allModules } from "./content_script"


const log = (...shit: any[]) => console.log("NyaaUtil::Background: INFO: ", ...shit)
const warning = (...shit: any[]) => console.log("NyaaUtil::Background: WARNING: ", ...shit)
const error = (...shit: any[]) => console.log("NyaaUtil::Background: ERROR:", ...shit)



interface Clock {
    moduleId: string
    countdown: number
}



const Clock = {
    clocks: allModules.map(mod => {
        return mod.backgroundTaskInterval ? { moduleId: mod.id, countdown: mod.backgroundTaskInterval } : undefined
    }).filter(i => i != undefined) as Array<Clock>,

    tick: () => {
        for (const clock of Clock.clocks) {
            clock.countdown -= 1
            if (clock.countdown <= 0) {
                const cb = allModules.filter(i => i.id === clock.moduleId).shift()
                if (cb && cb.backgroundTask) {
                    log("Executing", cb.id, "in the background.")
                    cb.backgroundTask(config)
                    clock.countdown = cb.backgroundTaskInterval as number
                }
            }
        }
    }
}





log(`Nyaa-Utility Background Worker`, config)

setInterval(async () => {
    // Main loop
    await config.loadConfig()
    Clock.tick()
}, 1000)
