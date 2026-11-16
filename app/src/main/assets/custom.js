window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});// ===== 平台自带：外链在当前页打开，保留勿动 =====
const hookClick = (e) => {
  const origin = e.target.closest('a');
  const isBaseTargetBlank = document.querySelector('head base[target="_blank"]');
  if (
    (origin && origin.href && origin.target === '_blank') ||
    (origin && origin.href && isBaseTargetBlank)
  ) {
    e.preventDefault();
    location.href = origin.href;
  }
};
window.open = function (url) {
  location.href = url;
};
document.addEventListener('click', hookClick, { capture: true });

// ===== 导出功能 =====
function inDesktopShell() {
  return !!(window.__TAURI__ || window.__TAURI_IPC__ || window.__TAURI_INTERNALS__);
}

async function exportWithDialog(data, defaultName, filters) {
  if (inDesktopShell() && window.__TAURI__) {
    try {
      const { save } = window.__TAURI__.dialog;
      const { writeFile, writeBinaryFile } = window.__TAURI__.fs;

      const selected = await save({
        defaultPath: defaultName,
        filters: filters || defaultFilters(defaultName),
        title: '选择保存位置',
      });
      if (!selected) return null;

      if (typeof data === 'string') {
        await writeFile(selected, data);
      } else if (data instanceof Uint8Array || ArrayBuffer.isView(data)) {
        await writeBinaryFile(selected, data);
      } else if (data instanceof Blob) {
        await writeBinaryFile(selected, new Uint8Array(await data.arrayBuffer()));
      } else {
        throw new Error('不支持的文件内容类型');
      }
      return selected;
    } catch (e) {
      console.error('桌面导出失败，降级浏览器下载：', e);
    }
  }

  const blob = data instanceof Blob
    ? data
    : typeof data === 'string'
      ? new Blob([data], { type: 'text/plain;charset=utf-8' })
      : new Blob([data]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = defaultName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return defaultName;
}

function defaultFilters(name) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  const map = {
    xlsx: { name: 'Excel 表格', extensions: ['xlsx'] },
    csv:  { name: 'CSV 表格',  extensions: ['csv'] },
    docx: { name: 'Word 文档', extensions: ['docx'] },
    pdf:  { name: 'PDF 文档',  extensions: ['pdf'] },
  };
  return map[ext] ? [map[ext]] : undefined;
}

function dateStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate());
}

// 通用导出：rows=数据，prefix=文件名前缀，ext=扩展名
async function exportTable(rows, prefix, ext) {
  const name = `${prefix}_${dateStr()}.${ext}`;
  const map = {
    xlsx: { name: 'Excel 表格', extensions: ['xlsx'] },
    csv:  { name: 'CSV 表格',  extensions: ['csv'] },
    docx: { name: 'Word 文档', extensions: ['docx'] },
    pdf:  { name: 'PDF 文档',  extensions: ['pdf'] },
  };
  const data = (typeof rows === 'string' && ext === 'csv') ? '\ufeff' + rows : rows;
  const saved = await exportWithDialog(data, name, map[ext]);
  if (saved) alert('已保存：' + saved);
  else console.log('用户取消导出');
}
```
