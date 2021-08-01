//prettier-ignore
const markDownloaded = () => {
    const html = `
        <div class="col-md-1">Mark done:</div>
        <div class="col-md-5">
            <button type="button" class="btn btn-xs">
            &nbsp;&nbsp;&nbsp; <i class="fa fa-check-circle-o" aria-hidden="true"></i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </button>
        </div>
    `

    $('div.panel-body > div:nth-child(5) > div:nth-child(1)')
    .toggleClass("col-md-offset-6")
    .before(html)
};

if (document.location.href.includes("/view/")) {
    nyaaUtility.storage.system.onload(markDownloaded);
}
