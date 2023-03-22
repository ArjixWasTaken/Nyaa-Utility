import { defineConfig } from "vite";
import webExtension, { readJsonFile } from "vite-plugin-web-extension";
import Solid from 'vite-plugin-solid';

function generateManifest() {
    const manifest = readJsonFile("src/manifest.json");
    const pkg = readJsonFile("package.json");
    return {
        name: pkg.name,
        description: pkg.description,
        version: pkg.version,
        ...manifest,
    };
}

const target = process.env.BROWSER_TARGET || "chrome"

export default defineConfig({
    plugins: [
        Solid(),
        webExtension({
            manifest: generateManifest,
            watchFilePaths: ["package.json", "manifest.json"],
            browser: target
        }),
    ],
    build: {
        outDir: `dist/${target}`
    }
});
