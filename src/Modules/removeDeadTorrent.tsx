import React from "react";
import { Config } from "../Storage/api";
import { Module } from "./index";

class DeadTorrentRemover implements Module {
  id = "deadTorrentRemover";
  shouldRun: RegExp = /((p|q)=)|(user\/)|(.si\/?)$/;
  injectWithConfig = true;
  options = (config: Config) => {
    const updateMinimums = async (
      countSeeders: number,
      countLeechers: number
    ) => {
      config.settings.minimumSeeders = countSeeders;
      config.settings.minimumLeechers = countLeechers;
      await config.saveConfig();
      window.location.reload();
    };

    const setEnabled = async (enabled: boolean) => {
      config.settings.removeTorrentsEnabled = enabled;
      await config.saveConfig();
      window.location.reload();
    };

    const setTorrentRemoveCondition = async (condition: string) => {
      config.settings.torrentRemoveCondition = condition;
      await config.saveConfig();
      window.location.reload();
    };

    return (
      <>
        <style>
          {`input {
                        margin: 10px;
                        width: 30px;
                        cursor: pointer;
                    }`}
        </style>
        Dead torrent remover enabled:
        <input
          type="checkbox"
          checked={config.settings.removeTorrentsEnabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        <br />
        Minimum seeders:
        <input
          type="number"
          min="0"
          value={config.settings.minimumSeeders}
          onChange={(e) =>
            updateMinimums(
              Number(e.target.value),
              config.settings.minimumLeechers
            )
          }
        />
        Minimum leechers:
        <input
          type="number"
          min="0"
          value={config.settings.minimumLeechers}
          onChange={(e) =>
            updateMinimums(
              config.settings.minimumSeeders,
              Number(e.target.value)
            )
          }
        />
        <br />
        <select
          value={config.settings.torrentRemoveCondition}
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
    if (config == undefined || !config.settings.removeTorrentsEnabled) return;

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
        (config.settings.torrentRemoveCondition == "seeders" &&
          seeders < config.settings.minimumSeeders) ||
        (config.settings.torrentRemoveCondition == "leechers" &&
          leechers < config.settings.minimumLeechers) ||
        seeders < config.settings.minimumSeeders ||
        leechers < config.settings.minimumLeechers
      ) {
        torrent.remove();
      }
    }
  }
}

export default DeadTorrentRemover;
