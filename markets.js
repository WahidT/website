/* hmm site - S7 THE THREE MARKETS AS ONE ASSET (GP ruling R-D37, 2026-09-15).

   The section held three paragraphs of prose, nine dotted bars and two tables. The general
   partner asked for one compressed, information-dense asset, so it is one table: the three
   markets as columns and, as rows, the things a family-office reader compares across them.

   EVERY FIGURE IS READ, NEVER TYPED, and each row names its owner:

     Leads                      data/necessity_matrix.js, the lead on the innovation row
     Instruments in force       data/market_strength.js, counted from data/reg_instruments.js
     Operative since 2020       the same rows, counted on `op`, the operative year
     Listing share              canon current.listing_prob, carried verbatim in the snapshot
                                and parsed here, never restated
     Exit route                 DERIVED from the listing share: where more than half of a
                                market's winner exits list, listings lead; otherwise trade
                                sale leads. The same derivation runs in
                                scripts/check-register-figures.mjs, so the route printed and
                                the share it rests on cannot disagree.

   The two gate rows are words, lifted from the market prose this table replaced, and they
   describe the health gates because that is where the page already owned the mechanism and
   the timing figure. Those figures (466 and 384 days, 30 working days) belong to external
   publications named on the sources page, which is why they are the only ones written here.

   rows(MS, NM) is pure and is exported on window so the build guard can execute this file
   under node and reconcile every derived cell against the data it was derived from. The
   render half runs only where a document exists. No colour literal; styles in index.css. */
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

  var GATE_ONE = {
    AU: "An entry on the Australian Register of Therapeutic Goods, held by a sponsor in the market. Supply without an entry is unlawful.",
    JP: "Agency approval, filed in Japanese through a designated marketing authorisation holder, a Japan-resident licence holder who files for the manufacturer because the agency accepts no application direct from abroad.",
    NZ: "No pre-market approval for a device. A sponsor notifies a database within 30 working days, the listing cannot be presented as an endorsement, and the record is earned offshore at a foreign regulator."
  };
  var GATE_TWO = {
    AU: "Pharmaceutical Benefits Scheme listing, 466 days from registration",
    JP: "Reimbursement listing, the fastest of the three",
    NZ: "Replacement regime, none in force"
  };

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
      { key: "gate1", label: "First gate, Heal", note: "what must be held before a sale is lawful",
        cells: GATE_ONE, prose: true },
      { key: "gate2", label: "Second gate, Heal", note: "what must be cleared before the sale is paid for; days on Medicines Australia's 2016 to 2021 series of new molecular entities, 384 across twenty OECD countries",
        cells: GATE_TWO, prose: true },
      { key: "route", label: "Exit route", note: "listings lead where more than half of a market's winner exits list",
        cells: per(function (c) { return routeOf(sh[c]); }) },
      { key: "inforce", label: "Instruments in force", note: "of " + total + " across the three",
        cells: per(function (c) { return String(reg[c].inForce); }) },
      { key: "since2020", label: "Operative since 2020", note: "of " + recent + " of those",
        cells: per(function (c) { return String(reg[c].since2020); }) },
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
    cap.textContent = "Australia, Japan and New Zealand compared on the system each leads, the two gates, the exit route, the instrument register and the listing share of winner exits";
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
