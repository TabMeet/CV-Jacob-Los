// Renders the SVG to a 1080x1080 PNG and a preview of how TikTok will show it (circles at several sizes).
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [svgPath, pngOut, previewOut] = process.argv.slice(2);
  const svg = fs.readFileSync(svgPath, 'utf8');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
  await page.setContent(`<html><body style="margin:0;background:#000">${svg.replace('<svg ', '<svg style="display:block;width:1080px;height:1080px" ')}</body></html>`);
  await page.screenshot({ path: pngOut });
  const b64 = fs.readFileSync(pngOut).toString('base64');
  const preview = await browser.newPage({ viewport: { width: 1000, height: 560 } });
  await preview.setContent(`<html><body style="margin:0;font:14px system-ui;background:#fff;color:#161823;display:flex;gap:40px;align-items:center;padding:30px">
    <div style="text-align:center"><img src="data:image/png;base64,${b64}" style="width:400px;height:400px;border-radius:50%;display:block"><p>profile page</p></div>
    <div style="text-align:center"><img src="data:image/png;base64,${b64}" style="width:96px;height:96px;border-radius:50%;display:block;margin:auto"><p>96 px</p></div>
    <div style="text-align:center"><img src="data:image/png;base64,${b64}" style="width:48px;height:48px;border-radius:50%;display:block;margin:auto"><p>48 px (feed)</p></div>
    <div style="text-align:center"><img src="data:image/png;base64,${b64}" style="width:32px;height:32px;border-radius:50%;display:block;margin:auto"><p>32 px (comments)</p></div>
    <div style="text-align:center;background:#121212;color:#eee;padding:16px;border-radius:12px"><img src="data:image/png;base64,${b64}" style="width:48px;height:48px;border-radius:50%;display:block;margin:auto;border:2px solid #fff"><p>dark mode</p></div>
  </body></html>`);
  await preview.screenshot({ path: previewOut });
  await browser.close();
})();
