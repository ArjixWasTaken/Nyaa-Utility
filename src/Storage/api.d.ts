declare interface settings {
    blockedUsers: string[]
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