/* QC keynotes: draw the preview, write the marked-up PDF, write the findings list.
   The export keeps the original page content (text stays selectable) and adds
   editable annotations: Highlight for keynote entries, Square for undefined callouts
   and unreadable pages. Each annotation has its own appearance, so it shows in any viewer. */
(function () {
  'use strict';
  const QC = window.QC;
  const COLOUR = {
    green: { rgb: [0.2, 0.62, 0.34], css: '#2e9e57' },
    yellow: { rgb: [0.97, 0.8, 0.1], css: '#f2c419' },
    red: { rgb: [0.85, 0.2, 0.15], css: '#d93a2a' },
  };
  QC.COLOUR = COLOUR;

  let renderToken = 0;

  // Draw page n at a given width, then draw a box for each finding on that page.
  QC.renderPreview = async (pdfDoc, pageNum, canvas, findings, cssWidth) => {
    const token = ++renderToken;
    const page = await pdfDoc.getPage(pageNum);
    const base = page.getViewport({ scale: 1 });
    const scale = (cssWidth || 700) / base.width;
    const vp = page.getViewport({ scale });
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(vp.width * dpr);
    canvas.height = Math.round(vp.height * dpr);
    canvas.style.width = vp.width + 'px';
    canvas.style.height = vp.height + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    if (token !== renderToken) return null; // a newer render has started

    for (const f of findings) {
      if (f.page !== pageNum) continue;
      const [x0, y0, x1, y1] = vp.convertToViewportRectangle(f.rect);
      const x = Math.min(x0, x1), y = Math.min(y0, y1), w = Math.abs(x1 - x0), h = Math.abs(y1 - y0);
      const c = COLOUR[f.colour].css;
      ctx.save();
      ctx.globalAlpha = f.kind === 'entry' ? 0.3 : 0.15;
      ctx.fillStyle = c;
      ctx.fillRect(x, y, w, h);
      ctx.globalAlpha = 1;
      ctx.lineWidth = 2;
      ctx.strokeStyle = c;
      ctx.strokeRect(x, y, w, h);
      ctx.restore();
    }
    return { width: vp.width, height: vp.height };
  };

  // Writes the marked-up PDF. Returns a Uint8Array.
  QC.exportMarked = async (srcBytes, findings, opts = {}) => {
    const { PDFDocument, PDFDict, PDFArray, PDFName, PDFNumber, PDFString, PDFHexString } = window.PDFLib;
    const doc = await PDFDocument.load(srcBytes, { ignoreEncryption: true });
    const ctx = doc.context;
    const pages = doc.getPages();

    const alphaState = ca => {
      const d = PDFDict.withContext(ctx);
      d.set(PDFName.of('Type'), PDFName.of('ExtGState'));
      d.set(PDFName.of('CA'), PDFNumber.of(1));
      d.set(PDFName.of('ca'), PDFNumber.of(ca));
      return ctx.register(d);
    };
    const nums = arr => {
      const a = PDFArray.withContext(ctx);
      arr.forEach(v => a.push(PDFNumber.of(v)));
      return a;
    };

    const addAnnot = (pageIdx, a) => {
      const [x0, y0, x1, y1] = a.rect;
      const w = x1 - x0, h = y1 - y0;
      const [r, g, b] = a.colour;
      const gs = alphaState(a.alpha);

      const res = PDFDict.withContext(ctx);
      const ext = PDFDict.withContext(ctx);
      ext.set(PDFName.of('GS'), gs);
      res.set(PDFName.of('ExtGState'), ext);

      const content = a.subtype === 'Highlight'
        ? `q /GS gs ${r} ${g} ${b} rg ${x0} ${y0} ${w} ${h} re f Q`
        : `q /GS gs ${r} ${g} ${b} rg ${r} ${g} ${b} RG 1.5 w ${x0 + 0.75} ${y0 + 0.75} ${w - 1.5} ${h - 1.5} re B Q`;

      const sd = PDFDict.withContext(ctx);
      sd.set(PDFName.of('Type'), PDFName.of('XObject'));
      sd.set(PDFName.of('Subtype'), PDFName.of('Form'));
      sd.set(PDFName.of('BBox'), nums([x0, y0, x1, y1]));
      sd.set(PDFName.of('Resources'), res);
      const apN = ctx.register(ctx.stream(content, sd));
      const ap = PDFDict.withContext(ctx);
      ap.set(PDFName.of('N'), apN);

      const d = PDFDict.withContext(ctx);
      d.set(PDFName.of('Type'), PDFName.of('Annot'));
      d.set(PDFName.of('Subtype'), PDFName.of(a.subtype));
      d.set(PDFName.of('Rect'), nums([x0, y0, x1, y1]));
      d.set(PDFName.of('C'), nums([r, g, b]));
      d.set(PDFName.of('F'), PDFNumber.of(4)); // print
      d.set(PDFName.of('T'), PDFString.of('QC keynotes'));
      d.set(PDFName.of('AP'), ap);
      if (a.subtype === 'Highlight') d.set(PDFName.of('QuadPoints'), nums([x0, y1, x1, y1, x0, y0, x1, y0]));
      if (a.subtype === 'Square') d.set(PDFName.of('IC'), nums([r, g, b]));
      if (a.contents) d.set(PDFName.of('Contents'), PDFHexString.fromText(a.contents));

      const page = pages[pageIdx];
      let arr = page.node.lookupMaybe(PDFName.of('Annots'), PDFArray);
      if (!arr) {
        arr = PDFArray.withContext(ctx);
        page.node.set(PDFName.of('Annots'), arr);
      }
      arr.push(ctx.register(d));
    };

    let count = 0;
    for (const f of findings) {
      const idx = f.page - 1;
      if (!pages[idx]) continue;
      const colour = COLOUR[f.colour].rgb;
      const text = opts.comments === false ? '' : (f.reasons || []).map(r => `${r.label}: ${r.detail}`).join('\n') || 'Matches the guideline';
      const contents = text ? `[${f.colour.toUpperCase()}] ${f.code ? f.code + ' ' : ''}${text}` : '';
      if (f.kind === 'entry') {
        addAnnot(idx, { subtype: 'Highlight', rect: f.rect, colour, alpha: 0.35, contents });
      } else {
        addAnnot(idx, { subtype: 'Square', rect: f.rect, colour, alpha: 0.2, contents });
      }
      count++;
    }
    return { bytes: await doc.save(), count };
  };

  QC.findingsCSV = (findings, fileName) => {
    const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const head = ['file', 'page', 'kind', 'code', 'colour', 'check', 'detail', 'keynote text'];
    const rows = [head.join(',')];
    for (const f of findings) {
      const list = f.reasons.length ? f.reasons : [{ check: '', detail: 'Matches the guideline' }];
      for (const r of list) {
        rows.push([fileName, f.page, f.kind, f.code, f.colour, r.check || '', r.detail, f.desc].map(esc).join(','));
      }
    }
    return rows.join('\n') + '\n';
  };
})();
