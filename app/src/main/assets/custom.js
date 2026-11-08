window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});// very important, if you don't know what it is, don't touch it
// 非常重要，不懂代码不要动，这里可以解决80%的问题，也可以生产1000+的bug
const hookClick = (e) => {
    const origin = e.target.closest('a')
    const isBaseTargetBlank = document.querySelector(
        'head base[target="_blank"]'
    )
    console.log('origin', origin, isBaseTargetBlank)
    if (
        (origin && origin.href && origin.target === '_blank') ||
        (origin && origin.href && isBaseTargetBlank)
    ) {
        e.preventDefault()
        console.log('handle origin', origin)
        location.href = origin.href
    } else {
        console.log('not handle origin', origin)
    }
}

window.open = function (url, target, features) {
    console.log('open', url, target, features)
    location.href = url
}

document.addEventListener('click', hookClick, { capture: true })
(function(){
    if (!window.URL && window.webkitURL) {
        window.URL = window.webkitURL;
    }
    window.pakeExportFile = function(content, filename, mimeType="text/plain;charset=utf-8"){
        try{
            const blob = new Blob([content], {type:mimeType});
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(()=>URL.revokeObjectURL(url),150);
        }catch(err){
            console.error("导出失败",err);
            alert("文件导出失败");
        }
    }
    window.pakeExportCsv = function(csvContent, fileName="data.csv"){
        window.pakeExportFile(csvContent, fileName, "text/csv;charset=utf-8");
    }
    window.pakeExportJson = function(jsonObj, fileName="data.json"){
        window.pakeExportFile(JSON.stringify(jsonObj,null,2), fileName, "application/json;charset=utf-8");
    }
})();
(async function() {
    if (!window.__TAURI__) return;
    const { save } = window.__TAURI__.dialog;
    const { writeBinaryFile } = window.__TAURI__.fs;

    window.platformSaveFile = async function(blob, fileName) {
        const path = await save({
            defaultPath: fileName,
            filters: [
                { name: "Excel表格", extensions: ["xlsx", "xls"] },
                { name: "PDF文件", extensions: ["pdf"] },
                { name: "CSV", extensions: ["csv"] },
                { name: "所有文件", extensions: ["*"] }
            ]
        });
        if (!path) return;
        const buf = await blob.arrayBuffer();
        await writeBinaryFile(path, new Uint8Array(buf));
        alert("文件保存完成");
    }

    const oldA = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = async function(e) {
        if(this.download && this.href) {
            e?.preventDefault();
            const res = await fetch(this.href);
            const blob = await res.blob();
            window.platformSaveFile(blob, this.download);
            return;
        }
        return oldA.call(this);
    }
})();
{
  "tauri": {
    "allowlist": {
      "dialog": {
        "save": true
      },
      "fs": {
        "writeFile": true,
        "scope": ["$DESKTOP/*", "$DOCUMENT/*"]
      }
    }
  }
}
