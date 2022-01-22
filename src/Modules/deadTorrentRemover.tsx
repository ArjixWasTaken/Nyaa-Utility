import React from "react";
import { Config } from "../Storage/api";
import { Module } from "./index";

class DeadTorrentRemover implements Module {
  id = "deadTorrentRemover";
  shouldRun: RegExp = /((p|q|s|o)=)|(user\/)|(\.si\/?)$/;
  injectWithConfig = true;
  options = (config: Config) => {
    const updateMinimums = async (
      countSeeders: number,
      countLeechers: number
    ) => {
      config.settings.deadTorrentsRemover.minimum[0] = countSeeders;
      config.settings.deadTorrentsRemover.minimum[1] = countLeechers;
      await config.saveConfig();
    };

    const setEnabled = async (enabled: boolean) => {
      config.settings.deadTorrentsRemover.enabled = enabled;
      await config.saveConfig();
    };

    const setTorrentRemoveCondition = async (condition: string) => {
      config.settings.deadTorrentsRemover.removeCondition = condition;
      await config.saveConfig();
    };


    const style = {
        margin: "10px",
        width: "30px",
        cursor: "pointer"
    }

    return (
      <>
        <div>
            Dead torrent remover enabled:
            <input
                type="checkbox"
                checked={config.settings.deadTorrentsRemover.enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                style={style}
            />
        </div>
        <div>
            Minimum seeders:
            <input
                type="number"
                min="0"
                value={config.settings.deadTorrentsRemover.minimum[0]}
                onChange={(e) =>
                    updateMinimums(
                    Number(e.target.value),
                    config.settings.deadTorrentsRemover.minimum[1]
                    )
                }
            />
        </div>
        <div>
            Minimum leechers:
            <input
                type="number"
                min="0"
                value={config.settings.deadTorrentsRemover.minimum[1]}
                onChange={(e) =>
                    updateMinimums(
                    config.settings.deadTorrentsRemover.minimum[0],
                    Number(e.target.value)
                    )
                }
            />
        </div>
        <div>
            <select
                value={config.settings.deadTorrentsRemover.removeCondition.toString()}
                onChange={(e) => setTorrentRemoveCondition(e.target.value)}
                >
                <option value="seeders">Seeders</option>
                <option value="leechers">Leechers</option>
                <option value="both">Both</option>
            </select>
        </div>
      </>
    );
  };
  async inject(config?: Config) {
    if (config == undefined || !config.settings.deadTorrentsRemover.enabled) return;

    let removeCondition = config.settings.deadTorrentsRemover.removeCondition
    let removeMinimums = config.settings.deadTorrentsRemover.minimum


    let torrents = Array.from(
      document.querySelectorAll(
        "body > div > div.table-responsive > table > tbody > tr"
      )
    ) as Array<HTMLElement>;

    for (const torrent of torrents) {
      const seeders = Number(
        torrent.querySelector("td:nth-child(6)")!.textContent
      );
      const leechers = Number(
        torrent.querySelector("td:nth-child(7)")!.textContent
      );


      if (
        (removeCondition == "seeders" && seeders < removeMinimums[0]) ||
        (removeCondition == "leechers" && leechers < removeMinimums[1]) ||
        (removeCondition == "both" && seeders < removeMinimums[0] && leechers < removeMinimums[1])) {
        torrent.style.display = "none";  // we don't actually remove the torrents, in case we need to re-access them in the future.
      }
    }
  }
}

export default DeadTorrentRemover;
