//prettier-ignore
const markDownloaded = () => {
    const html = `
        <label for="markDone" class="col-md-1">Mark done:</label>
        <input type="checkbox" class="col-md-5" id="markDone" data-toggle="toggle">
    `

    $('div.panel-body > div:nth-child(5) > div:nth-child(1)')
    .toggleClass("col-md-offset-6")
    .before(html)
};

if (document.location.href.includes("/view/")) {
    nyaaUtility.storage.system.onload(markDownloaded);
}
