// js/version.js: the only file to edit when a change is made. Newest entry first.
window.APP_VERSION = "0.5.0";
window.APP_CHANGELOG = [
  { version: "0.5.0", date: "2026-10-28", changes: [
    "新增 2.0 填词（每行一个词，从字库选字填空）和 3.0 描红（用手指或 Apple Pencil 写字，按笔顺打分，左下角看笔顺动画）；在 ⚙️ 里可以随时来回切换 1.0 / 2.0 / 3.0；字体换成楷体风格的霞鹜文楷。"
  ] },
  { version: "0.4.0", date: "2026-10-28", changes: [
    "最近学的字改成第4级总字表第29页最后60个字；题目优先用这些字；新增约60个带这些字的词。"
  ] },
  { version: "0.3.0", date: "2026-10-28", changes: [
    "超纲字（本册超纲字和「声」）一直显示拼音；最近学的词加入海报上的例词和「叫声」；写字表标明是一年级上册。"
  ] },
  { version: "0.2.0", date: "2026-10-28", changes: [
    "字库换成三张照片里的字（第3级新增60字、第4级240字、课本写字表100字，共266字）；词库只用这些字。"
  ] },
  { version: "0.1.0", date: "2026-10-27", changes: [
    "第一版：2×2 到 4×4；从字库拖字；简单（放对马上变绿）和挑战（最后检查）；拼音、繁体、加新词、撤销、答案、完成音乐。"
  ] }
];
(function () {
  var now = document.getElementById('versionNow'), list = document.getElementById('versionList');
  if (!now || !list) return;                      // the page has no version panel
  now.textContent = 'v' + window.APP_VERSION;
  list.textContent = '';
  window.APP_CHANGELOG.forEach(function (entry) {
    var li = document.createElement('li'), head = document.createElement('b'), ul = document.createElement('ul');
    head.textContent = 'v' + entry.version + ' · ' + entry.date;
    entry.changes.forEach(function (c) { var x = document.createElement('li'); x.textContent = c; ul.appendChild(x); });
    li.appendChild(head); li.appendChild(ul); list.appendChild(li);
  });
})();
