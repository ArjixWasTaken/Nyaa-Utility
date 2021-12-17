class Module {
    id: String = "";
    shouldRun: RegExp = new RegExp("");
    settings: {} = {};
    injectWithConfig: boolean = false;
    inject() {}
}

export { Module }