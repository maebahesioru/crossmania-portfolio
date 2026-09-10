// 各プロジェクトサイトのfaviconが実際に取得できるかを実測する
//  (手法: トップページのHTMLから <link rel="icon"> を探し、無ければ /favicon.ico を試す)
const SITES = [
  "https://nareaitter.hikamers.app/",
  "https://hikabooru.hikamers.app/",
  "https://takuya-tts.hikamers.app/",
  "https://sunsunsunday.hikamers.app/",
  "https://retweet-clicker.hikamers.app/",
  "https://illustsagasitter.hikamers.app/",
  "https://twigacha.hikamers.app/",
];
const UA = { "user-agent": "crossmania-portfolio/1.0 (+favicon)" };

const resolve = (base, href) => { try { return new URL(href, base).toString(); } catch { return null; } };

// HTMLからicon候補を優先度つきで集める
function iconCandidates(html, base) {
  const out = [];
  const re = /<link\b[^>]*>/gi;
  let m;
  while ((m = re.exec(html))) {
    const tag = m[0];
    const rel = (tag.match(/\brel\s*=\s*["']([^"']+)["']/i) || [])[1] || "";
    if (!/icon/i.test(rel)) continue;
    const href = (tag.match(/\bhref\s*=\s*["']([^"']+)["']/i) || [])[1];
    if (!href) continue;
    const url = resolve(base, href);
    if (!url) continue;
    const sizes = (tag.match(/\bsizes\s*=\s*["']([^"']+)["']/i) || [])[1] || "";
    // apple-touch-icon は高解像度なので加点、sizes指定が大きいものも加点
    let score = 0;
    if (/apple-touch-icon/i.test(rel)) score += 5;
    const px = Number((sizes.match(/(\d+)x\d+/) || [])[1] || 0);
    if (px) score += Math.min(px, 256) / 32;
    if (/\.svg(\?|$)/i.test(url)) score += 6; // ベクターは拡大しても綺麗
    if (/\.ico(\?|$)/i.test(url)) score -= 1;
    out.push({ url, rel, sizes, score });
  }
  return out.sort((a, b) => b.score - a.score);
}

const sniff = (buf, ctype) => {
  if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50) return "png";
  if (buf.length > 3 && buf[0] === 0x00 && buf[1] === 0x00 && buf[2] === 0x01) return "ico";
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8) return "jpeg";
  if (/^<svg|<\?xml/i.test(buf.subarray(0, 200).toString("utf8").trim())) return "svg";
  if (/gif/i.test(ctype || "")) return "gif";
  if (/webp/i.test(ctype || "")) return "webp";
  return "?" + (ctype || "unknown");
};

for (const site of SITES) {
  const host = new URL(site).host;
  let line = `${host.padEnd(30)} `;
  try {
    const r = await fetch(site, { headers: UA, signal: AbortSignal.timeout(12000) });
    const html = await r.text();
    const cands = iconCandidates(html, site);
    // 候補を順に試して最初に取れたものを使う
    const tries = [...cands.map((c) => c.url), resolve(site, "/favicon.ico")];
    let got = null;
    for (const u of tries) {
      if (!u) continue;
      try {
        const ir = await fetch(u, { headers: UA, signal: AbortSignal.timeout(12000) });
        if (!ir.ok) continue;
        const buf = Buffer.from(await ir.arrayBuffer());
        if (buf.length < 70) continue; // 空やエラーページを弾く
        got = { u, len: buf.length, kind: sniff(buf, ir.headers.get("content-type")) };
        break;
      } catch {}
    }
    if (got) line += `OK ${got.kind} ${got.len}B  ${got.u.replace(site, "./")}`;
    else line += `取得失敗 (候補${cands.length}件 / status=${r.status})`;
  } catch (e) {
    line += `ERR ${e.message}`;
  }
  console.log(line);
}
