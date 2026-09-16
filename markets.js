/* markets.js: the three markets as one table.

   Australia, Japan and New Zealand as columns and, as rows, three things a family-office reader
   compares across them: the system each market leads (from data/necessity_matrix.js, the
   specialisation index), the exit route (derived from the listing share: listings lead where
   more than half of a market's winner exits list), and the listing share of winner exits
   (canon current.listing_prob, carried in data/market_strength.js). GP instruction 2026-09-16:
   the two gate rows and the two register rows were cut, so the table carries concepts and
   percentages only. Every cell is derived here from the snapshots the build guard reads, and
   rows(MS, NM) is pure and exported on window so scripts/check-register-figures.mjs can run
   this file under node and reconcile each cell against its owner. */
(function () {
  var CODES = ["AU", "JP", "NZ"];
  var NAMES = { AU: "Australia", JP: "Japan", NZ: "New Zealand" };

  function listingShares(MS) {
    if (!MS || !MS.listing_prob) return null;
    var out = {}, s = String(MS.listing_prob);
    for (var i = 0; i < CODES.length; i++) {
      var m = s.match(new RegExp(CODES[i] + " ([\\d.]+)%"));
      if (!m) return null;
      out[CODES[i]] = m[1];
    }
    return out;
  }

  /* Listings lead where they take more than half of a market's winner exits. */
  function routeOf(sharePct) { return parseFloat(sharePct) > 50 ? "Listing" : "Trade sale"; }


  function rows(MS, NM) {
    var sh = listingShares(MS);
    if (!MS || !MS.register || !sh || !NM || !NM.leads) return null;
    var reg = MS.register, total = 0, recent = 0;
    for (var i = 0; i < CODES.length; i++) { total += reg[CODES[i]].inForce; recent += reg[CODES[i]].since2020; }
    if (typeof reg.total === "number" && reg.total !== total) return null;   // a stale snapshot draws nothing
    function per(f) { var o = {}; for (var j = 0; j < CODES.length; j++) o[CODES[j]] = f(CODES[j]); return o; }
    return [
      { key: "leads", label: "Leads", note: "the system each market leads, on the specialisation index",
        cells: per(function (c) { return NM.leads[c]; }) },
      { key: "route", label: "Exit route", note: "listings lead where more than half of a market's winner exits list",
        cells: per(function (c) { return routeOf(sh[c]); }) },
      { key: "listing", label: "Listing share of winner exits", note: "each market's share of its own winner exits, so the row does not sum",
        cells: per(function (c) { return sh[c] + "%"; }) }
    ];
  }
  if (typeof window !== "undefined") window.hmmMarketRows = rows;

  function render() {
    var root = document.getElementById("markets");
    if (!root) return;
    var R = rows(window.MARKET_STRENGTH, window.NECESSITY_MATRIX);
    if (!R) { root.setAttribute("data-state", "no-data"); return; }
    var t = document.createElement("table");
    t.className = "mkt-table";
    var cap = document.createElement("caption");
    cap.textContent = "Australia, Japan and New Zealand compared on the system each leads, the exit route and the listing share of winner exits";
    t.appendChild(cap);
    var thead = document.createElement("thead"), hr = document.createElement("tr");
    hr.appendChild(document.createElement("td"));
    CODES.forEach(function (c) {
      var th = document.createElement("th"); th.scope = "col"; th.className = "mkt-col mkt-col--" + c;
      th.textContent = NAMES[c]; hr.appendChild(th);
    });
    thead.appendChild(hr); t.appendChild(thead);
    var tb = document.createElement("tbody");
    R.forEach(function (r) {
      var tr = document.createElement("tr"), th = document.createElement("th");
      th.scope = "row";
      th.innerHTML = "<span class=\"mkt-rowlabel\"></span><span class=\"mkt-rownote\"></span>";
      th.firstChild.textContent = r.label; th.lastChild.textContent = r.note;
      tr.appendChild(th);
      CODES.forEach(function (c) {
        var td = document.createElement("td");
        td.className = r.prose ? "mkt-prose" : "mkt-fig";
        td.textContent = r.cells[c];
        tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
    t.appendChild(tb);
    var wrap = document.createElement("div");
    wrap.className = "mkt-tablewrap";
    wrap.appendChild(t);
    root.appendChild(wrap);
  }

  if (typeof document === "undefined") return;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
