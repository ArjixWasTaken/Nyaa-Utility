import React from "react";
import { Config } from "../Storage/api";
import { Module } from "./index";

class DeadTorrentRemover implements Module {
  id = "deadTorrentRemover";
  shouldRun: RegExp = /((p|q)=)|(user\/)|(\.si\/?)$/;
  injectWithConfig = true;
  options = (config: Config) => {
    const updateMinimums = async (
      countSeeders: number,
      countLeechers: number
    ) => {
      config.settings.deadTorrentsRemover.minimumSeeders = countSeeders;
      config.settings.deadTorrentsRemover.minimumLeechers = countLeechers;
      await config.saveConfig();
      window.location.reload();
    };

    const setEnabled = async (enabled: boolean) => {
      config.settings.deadTorrentsRemover.removeTorrentsEnabled = enabled;
      await config.saveConfig();
      window.location.reload();
    };

    const setTorrentRemoveCondition = async (condition: string) => {
      config.settings.deadTorrentsRemover.torrentRemoveCondition = condition;
      await config.saveConfig();
      window.location.reload();
    };


    const style = {
        margin: "10px",
        width: "30px",
        cursor: "pointer"
    }

    return (
      <>
        Dead torrent remover enabled:
        <input
          type="checkbox"
          checked={config.settings.deadTorrentsRemover.removeTorrentsEnabled}
          onChange={(e) => setEnabled(e.target.checked)}
          style={style}
        />
        <br />
        Minimum seeders:
        <input
          type="number"
          min="0"
          value={config.settings.deadTorrentsRemover.minimumSeeders}
          onChange={(e) =>
            updateMinimums(
              Number(e.target.value),
              config.settings.deadTorrentsRemover.minimumLeechers
            )
          }
        />
        Minimum leechers:
        <input
          type="number"
          min="0"
          value={config.settings.deadTorrentsRemover.minimumLeechers}
          onChange={(e) =>
            updateMinimums(
              config.settings.deadTorrentsRemover.minimumSeeders,
              Number(e.target.value)
            )
          }
        />
        <br />
        <select
          value={config.settings.deadTorrentsRemover.torrentRemoveCondition}
          onChange={(e) => setTorrentRemoveCondition(e.target.value)}
        >
          <option value="seeders">Seeders</option>
          <option value="leechers">Leechers</option>
          <option value="both">Both</option>
        </select>
        <br />
      </>
    );
  };
  async inject(config?: Config) {
    if (config == undefined || !config.settings.deadTorrentsRemover.removeTorrentsEnabled) return;

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
        (config.settings.deadTorrentsRemover.torrentRemoveCondition == "seeders" &&
          seeders < config.settings.deadTorrentsRemover.minimumSeeders) ||
        (config.settings.deadTorrentsRemover.torrentRemoveCondition == "leechers" &&
          leechers < config.settings.deadTorrentsRemover.minimumLeechers) ||
        seeders < config.settings.deadTorrentsRemover.minimumSeeders ||
        leechers < config.settings.deadTorrentsRemover.minimumLeechers
      ) {
        torrent.remove();
      }
    }
  }
}

export default DeadTorrentRemover;
