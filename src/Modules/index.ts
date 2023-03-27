import type { JSX } from "solid-js";
import type { Config } from "../storage"

export interface Module {
    id: String; // Module ID
    shouldRun: RegExp; // A regular expression that is matched against window.location.href
    injectWithConfig: boolean; // Indicates whether the module will be injected with or without the config
    backgroundTaskInterval?: number // The interval (in seconds) that the task should be run at.
    backgroundTask?: (config: Config) => void; // The body of the background task.

    options?: (config: Config) => JSX.Element | void; // JSX to render in the options page.
    inject: (config?: Config) => void; // the body of the module
    injectCss?: string;
}

import CommentReply from "./commentReply";
import UserBlocker from "./userBlocker";

export const allModules: Module[] = [new CommentReply, new UserBlocker];
