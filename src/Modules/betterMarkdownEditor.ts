import type { Module } from "./index";
import type { Config } from "../storage";
import EasyMDE from "easymde";
import browser from "webextension-polyfill";

export default class CommentReplyBtn implements Module {
    id = "betterMarkdownEditor";
    shouldRun: RegExp = /\/view\/\d+/;
    injectWithConfig = true;

    async inject(config?: Config) {
        if (!config) return;

        // prettier-ignore
        const element = document.querySelector<HTMLTextAreaElement>("textarea#comment")
        // prettier-ignore
        const submitBtn = document.querySelector<HTMLButtonElement>(`.comment-box input[type="submit"]`);
        // prettier-ignore
        const form = document.querySelector<HTMLFormElement>("form.comment-box");
        if (!element || !submitBtn || !form) return;

        const state = {
            isSubmitting: false,
        }

        const editor = new EasyMDE({
            element,
            promptURLs: true,
            autosave: {
                enabled: true,
                uniqueId: `autosaved-comment-${location.pathname}`,
            },
            previewImagesInEditor: true,
            theme: document.body.classList.contains("dark") ? "dark" : "light",
        });

        submitBtn.type = "button";
        submitBtn.onclick = () => {
            if (state.isSubmitting) return;

            const len = editor.value().length;
            if (len < 3 || len > 2048) {
                alert("Comment must be between 3 and 2048 characters");
                return;
            }

            editor.toTextArea();
            state.isSubmitting = true;

            submitBtn.type = "submit";
            submitBtn.click();

            submitBtn.disabled = true;
        }

        form.onsubmit = () => {
            // clears the autosaved value
            editor.codemirror.setValue("");
        }
    }

    injectCss = new URL(browser.runtime.getURL("easymde.min.css"));
}
