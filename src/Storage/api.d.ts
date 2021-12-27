declare interface settings {
        blockedUsers: string[]
        removeTorrentsEnabled: boolean
        minimumSeeders: number
        minimumLeechers: number
        torrentRemoveCondition: string
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