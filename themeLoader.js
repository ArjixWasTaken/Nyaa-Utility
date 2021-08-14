console.log("ThemeLoader is initiating...");
const themes = [];
const themeUtil = {
    initialized: false,
    onload: (callback) => {
        // thanks to https://stackoverflow.com/q/21518381/13077523
        if (!themeUtil.initialized) {
            setTimeout(() => {
                themeUtil.onload(callback);
            }, 100);
        } else {
            callback();
        }
    },
    setTheme: (themeName) => {
        localStorage.setItem("theme_name", themeName);
    },
    getTheme: () => {
        return localStorage.getItem("theme_name");
    },
    removeTheme: () => {
        localStorage.removeItem("theme_name");
    },
};

const loadThemes = async () => {
    const link = chrome.runtime.getURL("assets/themes.json");
    const data = await (await fetch(link)).json();

    for (const item of data) {
        themes.push(Object(item));
    }
    themeUtil.initialized = true;
};

const verifyTheme = (themeName) => {
    let found = false;

    for (const themeObj of themes) {
        if (themeObj.theme_name == themeName) {
            found = true;
            break;
        }
    }
    return found;
};

const themeLoaderMain = async () => {
    const theme_settings = {};
    const default_theme = "Nyaa Dark";

    if (themeUtil.getTheme() == null) {
        themeUtil.setTheme(default_theme);
        theme_settings.selectedTheme = default_theme;
    } else {
        if (verifyTheme(themeUtil.getTheme())) {
            theme_settings.selectedTheme = themeUtil.getTheme();
        } else {
            themeUtil.setTheme(default_theme);
            theme_settings.selectedTheme = default_theme;
        }
    }

    const applyCssProperty = (selector, property, value) => {
        $(selector).css(property, value);
    };

    const styles = {
        "body.dark": {
            "background-color": "background_dark",
        },
        "body.dark .navbar-inverse": {
            "background-color": "background",
        },
        "body.dark table": {
            "background-color": "background_light",
        },
        "body.dark .table-striped > tbody > tr": {
            "background-color": "background_light",
        },
        "body.dark table.torrent-list tbody .comments": {
            "background-color": "background_light",
        },
    };

    if (!window.location.href.includes("/static/")) {
        for (const theme of themes) {
            if (theme.theme_name == theme_settings.selectedTheme) {
                for (const [key, value] of Object.entries(styles)) {
                    for (const [cssProperty, themeKey] of Object.entries(
                        value
                    )) {
                        if (Object(theme).hasOwnProperty(themeKey)) {
                            applyCssProperty(key, cssProperty, theme[themeKey]);
                        }
                    }
                }
                console.log(`Applied the theme: ${theme.theme_name}`);
                break;
            }
        }
    }
};

loadThemes().then(themeLoaderMain);
