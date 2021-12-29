declare interface torrent {
    id: number
    commentsCount: number
}

declare interface settings {
        blockedUsers: string[]
        deadTorrentsRemover: {
            removeTorrentsEnabled: boolean
            minimumSeeders: number
            minimumLeechers: number
            torrentRemoveCondition: string
        }
        newCommentsNotifier: Array<torrent>
}

declare class Config {
    username: string;
    settings: settings;
    initialized: Boolean;
    onload(callback: Function): void;
    saveConfig(): Promise<void>;
    constructor();
}
declare const config: Config;
export default config;
export { config, Config };