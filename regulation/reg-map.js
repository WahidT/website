/* reg-map.js: Regulation Intelligence Dashboard
   Single IIFE. No external dependencies beyond Leaflet, Chart.js, and window.REGULATIONS_DATA.
*/
(function () {
  'use strict';

  /* ============================================
     CONSTANTS
     ============================================ */
  /* Brand colours resolve to the canonical tokens in hmm-tokens.css, read off :root at boot.
     Leaflet and Chart.js paint to canvas and SVG attributes, which cannot resolve var(), so the
     computed value is read once here. A missing token throws rather than falling back, because a
     silent fallback is how a retired colour survives a palette change. */
  function token(name) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if (!v) throw new Error('Design token ' + name + ' is not defined; is hmm-tokens.css loaded?');
    return v;
  }
  function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function alpha(hex, a) {
    const [r, g, b] = hexToRgb(hex);
    return `rgba(${r},${g},${b},${a})`;
  }
  function mix(hexA, hexB, t) {
    const a = hexToRgb(hexA), b = hexToRgb(hexB);
    const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
    return c;
  }

  const COLORS = {};
  /* Body face for canvas text, read from the same custom property the stylesheet uses so the
     charts change face when the site does. Chart.js and ctx.font take a CSS family list. */
  let FONT_BODY = "'Raela Grotesque', 'Helvetica Neue', sans-serif";
  function loadColors() {
    FONT_BODY = token('--font-body') || FONT_BODY;
    COLORS.evergreen  = token('--hmm-field-dark');     // GREEN RETIRED (GP 2026-08-09): the ground is the near-black field
    COLORS.pearl      = token('--hmm-pearl-beige');
    COLORS.tomato     = token('--hmm-tomato-jam');
    COLORS.mahogany   = token('--hmm-rich-mahogany');
    COLORS.accentDark = token('--hmm-accent-dark');    // accent as text on the dark ground, 4.55:1
    COLORS.pearlMuted     = alpha(COLORS.pearl, 0.6);
    COLORS.pearlFaint     = alpha(COLORS.pearl, 0.35);
    COLORS.gridLine       = alpha(COLORS.pearl, 0.07);
    COLORS.gridLineBright = alpha(COLORS.pearl, 0.12);
    /* Legislative-status colours resolve to the status tokens ruled on 2026-09-07 (design repo,
       group "Status and region signals"). The washes are the same token at alpha, so a token
       change moves the fill with the stroke. */
    COLORS.enacted        = token('--hmm-status-effective');
    COLORS.enactedBg      = alpha(COLORS.enacted, 0.3);
    COLORS.inParliament   = token('--hmm-status-transitional');
    COLORS.inParliamentBg = alpha(COLORS.inParliament, 0.3);
    COLORS.expected       = token('--hmm-status-expected');
    COLORS.expectedBg     = alpha(COLORS.expected, 0.3);
    /* Radar region series, in the order buildRadarChart lists the regions. */
    COLORS.region01 = token('--hmm-region-01');
    COLORS.region02 = token('--hmm-region-02');
    COLORS.region03 = token('--hmm-region-03');
    COLORS.region04 = token('--hmm-region-04');
    COLORS.region05 = token('--hmm-region-05');
  }

  /* Core markets. Singapore left fund scope on 2026-07-13. */
  const CORE_MARKETS = ['AU', 'JP', 'NZ'];

  const SECTOR_DEFS = {
    'Autonomous Systems':       'Drone and AV licensing, remote ID, BVLOS approvals',
    'AI Governance':            'AI safety frameworks, high-risk AI classification, mandatory guardrails',
    'Agritech & Food Safety':   'Novel food approvals, traceability mandates, safety certifications',
    'Regulated Health Tech':    'Medical device approvals (TGA, PMDA, HSA, FDA), digital health clearances',
    'Critical Minerals':        'Supply chain due diligence, traceability, export controls',
    'Infrastructure & Construction': 'BIM mandates, building codes, energy efficiency standards',
    'Global Logistics':         'Customs modernisation, trade compliance, origin declarations',
    'Financial Services':       'Banking licences, payment licences, AML/KYC, prudential regulation',
    'Data Privacy':             'Data protection laws, cross-border transfer rules, consent frameworks',
    'Energy & Utilities':       'Generation licences, grid access, carbon markets, renewable certificates',
    'Telecom':                  'Spectrum licences, 5G regulation, tower sharing mandates',
    'Defence & Dual-Use':       'Export controls, strategic goods, defence procurement rules',
    'Maritime & Aviation':      'Port permits, shipping compliance, air operator certificates',
    'Education':                'EdTech accreditation, qualification frameworks',
    'Environmental & ESG':      'Emissions trading, ESG reporting, waste management',
    'Insurance':                'Insurance licences, solvency requirements',
  };

  const SECTOR_GROUPS = {
    'Tech & AI':           ['AI Governance', 'Autonomous Systems', 'Data Privacy', 'Telecom'],
    'Health & Safety':     ['Regulated Health Tech', 'Agritech & Food Safety'],
    'Finance & Insurance': ['Financial Services', 'Insurance'],
    'Infrastructure':      ['Infrastructure & Construction', 'Energy & Utilities'],
    'Trade & Logistics':   ['Global Logistics', 'Maritime & Aviation', 'Critical Minerals'],
    'Defence & Regulation':['Defence & Dual-Use', 'Environmental & ESG', 'Education'],
  };

  /* Escape text before it is interpolated into innerHTML. Regulation names come from the
     dataset and four of them already carry & < > or ". */
  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ============================================
     STATE
     ============================================ */
  let allRegs    = [];
  let filteredRegs = [];
  let map, markersGroup;
  let activeFilters = {
    sectors:  [],
    tiers:    [],
    statuses: [],
    regions:  [],
    yearMin:  1300,
    yearMax:  2028,
    includeUndated: true,
  };
  const chartInstances = {};

  /* ============================================
     INIT
     ============================================ */
  function init() {
    try {
      // Mobile hamburger
      const hBtn   = document.getElementById('nav-hamburger');
      const hLinks = document.getElementById('nav-links');
      if (hBtn && hLinks) {
        hBtn.addEventListener('click', () => {
          const open = hLinks.classList.toggle('is-open');
          hBtn.classList.toggle('is-open');
          hBtn.setAttribute('aria-expanded', String(open));
        });
        hLinks.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => {
          hLinks.classList.remove('is-open');
          hBtn.classList.remove('is-open');
          hBtn.setAttribute('aria-expanded', 'false');
        }));
        document.addEventListener('click', e => {
          if (!hBtn.contains(e.target) && !hLinks.contains(e.target)) {
            hLinks.classList.remove('is-open');
            hBtn.classList.remove('is-open');
            hBtn.setAttribute('aria-expanded', 'false');
          }
        });
      }

      loadColors();

      const data = window.REGULATIONS_DATA;
      if (!data) throw new Error('window.REGULATIONS_DATA not found');
      allRegs = data.regulations;

      buildFilters(data);
      applyFilters();       // sets filteredRegs
      updateLiveStats();    // populate stats bar
      initPanelClose();     // safe: DOM is ready
      initMap();
      // Charts render immediately. No lazy loading / IntersectionObserver
      initCharts();
    } catch (e) {
      console.error('Regulation dashboard init failed:', e);
      const el = document.getElementById('live-count');
      if (el) el.textContent = 'Error loading data';
    }
  }

  /* ============================================
     FILTER SETUP
     ============================================ */
  function buildFilters(data) {
    // Regions
    const regionContainer = document.getElementById('filter-region');
    data.regions.forEach(r => {
      regionContainer.appendChild(makeCheckbox(r, r, 'filter-region-cb', true));
      activeFilters.regions.push(r);
    });

    // Sectors
    const sectorContainer = document.getElementById('filter-sector');
    data.sectors.forEach(s => {
      sectorContainer.appendChild(makeCheckbox(s, s, 'filter-sector-cb', true));
      activeFilters.sectors.push(s);
    });

    // Tiers
    const tierContainer = document.getElementById('filter-tier');
    ['T1', 'T2'].forEach(t => {
      const label = t === 'T1' ? 'T1: Direct Moat' : 'T2: Indirect Moat';
      tierContainer.appendChild(makeCheckbox(t, label, 'filter-tier-cb', true));
      activeFilters.tiers.push(t);
    });

    // Statuses
    const statusContainer = document.getElementById('filter-status');
    // No row carries 'deprecated' (checked against data/regulations.json, 0 of 865), so it is not offered.
    ['enacted', 'in_parliament', 'expected'].forEach(s => {
      const label = s === 'in_parliament' ? 'In Parliament'
        : s.charAt(0).toUpperCase() + s.slice(1);
      statusContainer.appendChild(makeCheckbox(s, label, 'filter-status-cb', true));
      activeFilters.statuses.push(s);
    });

    // Toggle dropdowns
    document.querySelectorAll('.filter-toggle').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const targetId = btn.getAttribute('data-target');
        const dropdown = document.getElementById(targetId);
        const isOpen   = dropdown.classList.contains('is-open');
        closeAllDropdowns();
        if (!isOpen) {
          dropdown.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    document.addEventListener('click', () => closeAllDropdowns());
    window.addEventListener('scroll', () => closeAllDropdowns(), { passive: true });

    // Checkbox change
    document.querySelectorAll('.filter-dropdown input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', onFilterChange);
    });

    // Year sliders
    const yearMin = document.getElementById('year-min');
    const yearMax = document.getElementById('year-max');

    function updateYearDisplay() {
      const mn = parseInt(yearMin.value);
      const mx = parseInt(yearMax.value);
      const el = document.getElementById('year-display');
      el.textContent = (mn <= 1300 && mx >= 2028) ? 'All years' : `${mn}–${mx}`;
    }

    // A range input fires 'input' on every pixel of a drag, and each event used to rebuild the
    // whole marker layer. Both sliders now schedule one refresh per animation frame: the
    // display text updates immediately (cheap), the filter/map/stats pass runs at most once a frame.
    let yearFrame = 0;
    function scheduleYearRefresh() {
      if (yearFrame) return;
      yearFrame = requestAnimationFrame(() => {
        yearFrame = 0;
        applyFilters();
        updateMap();
        updateLiveStats();
      });
    }
    yearMin.addEventListener('input', () => {
      if (parseInt(yearMin.value) > parseInt(yearMax.value)) yearMin.value = yearMax.value;
      activeFilters.yearMin = parseInt(yearMin.value);
      updateYearDisplay();
      scheduleYearRefresh();
    });
    yearMax.addEventListener('input', () => {
      if (parseInt(yearMax.value) < parseInt(yearMin.value)) yearMax.value = yearMin.value;
      activeFilters.yearMax = parseInt(yearMax.value);
      updateYearDisplay();
      scheduleYearRefresh();
    });

    // Undated rows (165 of 865) have no year to test against the range. The checkbox decides
    // whether they pass the year filter; it defaults on so the initial view matches the dataset.
    const undated = document.getElementById('include-undated');
    undated.addEventListener('change', () => {
      activeFilters.includeUndated = undated.checked;
      applyFilters();
      updateMap();
      updateLiveStats();
    });

    // Reset
    document.getElementById('filter-reset').addEventListener('click', () => {
      document.querySelectorAll('.filter-dropdown input[type="checkbox"]').forEach(cb => { cb.checked = true; });
      yearMin.value = 1300;
      yearMax.value = 2028;
      activeFilters.yearMin = 1300;
      activeFilters.yearMax = 2028;
      undated.checked = true;
      activeFilters.includeUndated = true;
      document.getElementById('year-display').textContent = 'All years';
      onFilterChange();
    });
  }

  function makeCheckbox(value, label, cls, checked) {
    const lbl   = document.createElement('label');
    const input = document.createElement('input');
    input.type      = 'checkbox';
    input.value     = value;
    input.className = cls;
    input.checked   = checked;
    lbl.appendChild(input);
    lbl.appendChild(document.createTextNode(' ' + label));
    return lbl;
  }

  function closeAllDropdowns() {
    document.querySelectorAll('.filter-dropdown').forEach(d => d.classList.remove('is-open'));
    document.querySelectorAll('.filter-toggle').forEach(b => b.setAttribute('aria-expanded', 'false'));
  }

  function onFilterChange() {
    activeFilters.regions  = getChecked('filter-region-cb');
    activeFilters.sectors  = getChecked('filter-sector-cb');
    activeFilters.tiers    = getChecked('filter-tier-cb');
    activeFilters.statuses = getChecked('filter-status-cb');
    applyFilters();
    updateMap();
    updateLiveStats();
  }

  function getChecked(cls) {
    return Array.from(document.querySelectorAll('.' + cls + ':checked')).map(cb => cb.value);
  }

  function applyFilters() {
    filteredRegs = allRegs.filter(r =>
      activeFilters.regions.includes(r.region)   &&
      activeFilters.sectors.includes(r.sector)   &&
      activeFilters.tiers.includes(r.tier)       &&
      activeFilters.statuses.includes(r.status)  &&
      (r.year == null
        ? activeFilters.includeUndated
        : (r.year >= activeFilters.yearMin && r.year <= activeFilters.yearMax))
    );
    const countries = new Set(filteredRegs.map(r => r.iso));
    const countEl   = document.getElementById('live-count');
    if (countEl) {
      countEl.textContent = `${filteredRegs.length.toLocaleString()} regulations across ${countries.size} countries`;
    }
  }

  /* ============================================
     LIVE STATS BAR
     ============================================ */
  function updateLiveStats() {
    const regs = filteredRegs;

    const t1 = regs.filter(r => r.tier === 'T1').length;
    const t2 = regs.filter(r => r.tier === 'T2').length;
    const countries = new Set(regs.map(r => r.iso));

    // Top sector by count
    const sectorMap = {};
    regs.forEach(r => { sectorMap[r.sector] = (sectorMap[r.sector] || 0) + 1; });
    const topSector = Object.entries(sectorMap).sort((a,b) => b[1]-a[1])[0];

    // Most regulated country
    const countryMap = {};
    regs.forEach(r => { countryMap[r.country] = (countryMap[r.country] || 0) + 1; });
    const topCountry = Object.entries(countryMap).sort((a,b) => b[1]-a[1])[0];

    setText('stat-total',       regs.length.toLocaleString());
    setText('stat-t1',          t1.toLocaleString());
    setText('stat-t2',          t2.toLocaleString());
    setText('stat-countries',   countries.size.toLocaleString());
    setText('stat-top-sector',  topSector  ? topSector[0]  : '-');
    setText('stat-top-country', topCountry ? topCountry[0] : '-');
  }

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  /* ============================================
     MAP
     ============================================ */
  function initMap() {
    map = L.map('map', {
      center:          [20, 80],
      zoom:            2,
      minZoom:         2,
      maxZoom:         8,
      zoomControl:     true,
      scrollWheelZoom: true,
      worldCopyJump:   true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    markersGroup = L.layerGroup().addTo(map);
    updateMap();
  }

  function updateMap() {
    if (!markersGroup) return;
    markersGroup.clearLayers();

    // Aggregate by country
    const byCountry = {};
    filteredRegs.forEach(r => {
      if (!byCountry[r.iso]) {
        byCountry[r.iso] = { country: r.country, iso: r.iso, lat: r.lat, lng: r.lng, region: r.region, regs: [] };
      }
      byCountry[r.iso].regs.push(r);
    });

    const allCounts = Object.values(byCountry).map(c => c.regs.length);
    const maxCount  = Math.max(...allCounts, 1);

    Object.values(byCountry).forEach(c => {
      const count  = c.regs.length;
      const ratio  = count / maxCount;
      const radius = 7 + ratio * 26;
      const isCore = CORE_MARKETS.includes(c.iso);

      // Interpolate pearl to tomato by density, from the token values
      const [cr, cg, cb] = mix(COLORS.pearl, COLORS.tomato, ratio);
      const fillColor = `rgb(${cr},${cg},${cb})`;

      // Core market: outer pulsing ring marker (drawn first so it's underneath)
      if (isCore) {
        const pulse = L.circleMarker([c.lat, c.lng], {
          radius:      radius + 8,
          fillColor:   'transparent',
          fillOpacity: 0,
          color:       COLORS.tomato,
          weight:      1.5,
          opacity:     0.5,
          className:   'core-pulse',
        });
        pulse.addTo(markersGroup);
      }

      // Main circle
      const marker = L.circleMarker([c.lat, c.lng], {
        radius:      radius,
        fillColor:   fillColor,
        fillOpacity: 0.55 + ratio * 0.35,
        color:       isCore ? COLORS.tomato : alpha(COLORS.pearl, 0.25),
        weight:      isCore ? 2.5 : 1,
        className:   isCore ? 'core-market-marker' : '',
      });

      // Rich tooltip
      const t1 = c.regs.filter(r => r.tier === 'T1').length;
      const t2 = c.regs.filter(r => r.tier === 'T2').length;
      const sectorMap = {};
      c.regs.forEach(r => { sectorMap[r.sector] = (sectorMap[r.sector] || 0) + 1; });
      const topSectors = Object.entries(sectorMap)
        .sort((a,b) => b[1]-a[1])
        .slice(0,3)
        .map(([s, n]) => `${s} (${n})`)
        .join(', ');

      const coreBadge = isCore
        ? `<span class="tooltip-core-badge">Core Market</span>` : '';

      marker.bindTooltip(`
        <div class="tooltip-country">${esc(c.country)}${coreBadge}</div>
        <div class="tooltip-count">${esc(count)} regulation${count !== 1 ? 's' : ''}</div>
        <div class="tooltip-tiers">T1: ${esc(t1)} &nbsp;·&nbsp; T2: ${esc(t2)}</div>
        <div class="tooltip-region">${esc(c.region)}</div>
        <div class="tooltip-sectors">Top sectors: ${esc(topSectors)}</div>
      `, { className: 'country-tooltip', direction: 'top', offset: [0, -(radius + 4)] });

      marker.on('click', () => openCountryPanel(c));
      marker.addTo(markersGroup);
    });
  }

  /* ============================================
     COUNTRY PANEL
     ============================================ */
  function openCountryPanel(c) {
    const panel = document.getElementById('country-panel');
    const isCore = CORE_MARKETS.includes(c.iso);

    document.getElementById('panel-title').textContent = c.country;
    document.getElementById('panel-meta').textContent =
      c.region + (isCore ? ' · Core Market' : '');
    document.getElementById('panel-count').textContent =
      `${c.regs.length} regulation${c.regs.length !== 1 ? 's' : ''} matching current filters`;

    const body = document.getElementById('panel-body');
    body.innerHTML = '';

    // Group by sector
    const bySector = {};
    c.regs.forEach(r => {
      if (!bySector[r.sector]) bySector[r.sector] = [];
      bySector[r.sector].push(r);
    });

    Object.keys(bySector).sort().forEach(sector => {
      const group = document.createElement('div');
      group.className = 'panel-sector-group';

      const secName = document.createElement('div');
      secName.className = 'panel-sector-name';
      secName.textContent = sector;
      group.appendChild(secName);

      bySector[sector]
        .sort((a,b) => (b.year || 0) - (a.year || 0))
        .forEach(reg => {
          const statusLabel = reg.status === 'in_parliament' ? 'In Parliament'
            : reg.status.charAt(0).toUpperCase() + reg.status.slice(1);

          const row = document.createElement('div');
          row.className = 'panel-reg';
          row.innerHTML = `
            <div class="panel-reg-info">
              <div class="panel-reg-name">${esc(reg.name)}</div>
              <div class="panel-reg-year">${esc(reg.year || '-')}</div>
            </div>
            <div class="panel-badges">
              <span class="badge badge--${esc(reg.status)}">${esc(statusLabel)}</span>
              <span class="badge badge--${esc(reg.tier.toLowerCase())}">${esc(reg.tier)}</span>
            </div>
          `;
          group.appendChild(row);
        });

      body.appendChild(group);
    });

    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
  }

  function initPanelClose() {
    document.getElementById('panel-close').addEventListener('click', () => {
      const panel = document.getElementById('country-panel');
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
    });
  }

  /* ============================================
     CHART DEFAULTS
     ============================================ */
  function applyChartDefaults() {
    Chart.defaults.font.family = FONT_BODY;
    Chart.defaults.font.size   = 12;
    Chart.defaults.color       = COLORS.pearlMuted;
    Chart.defaults.borderColor = COLORS.gridLine;

    Chart.defaults.plugins.tooltip.backgroundColor  = alpha(COLORS.evergreen, 0.97);
    Chart.defaults.plugins.tooltip.titleColor        = COLORS.pearl;
    Chart.defaults.plugins.tooltip.bodyColor         = alpha(COLORS.pearl, 0.8);
    Chart.defaults.plugins.tooltip.footerColor       = alpha(COLORS.pearl, 0.45);
    Chart.defaults.plugins.tooltip.borderColor       = alpha(COLORS.pearl, 0.15);
    Chart.defaults.plugins.tooltip.borderWidth       = 1;
    Chart.defaults.plugins.tooltip.cornerRadius      = 8;
    Chart.defaults.plugins.tooltip.padding           = { x: 14, y: 12 };
    Chart.defaults.plugins.tooltip.titleFont         = { weight: '600', size: 13 };
    Chart.defaults.plugins.tooltip.bodyFont          = { size: 12 };
    Chart.defaults.plugins.tooltip.footerFont        = { size: 11, style: 'italic' };
    Chart.defaults.plugins.tooltip.displayColors     = true;
    Chart.defaults.plugins.tooltip.boxPadding        = 4;
  }

  /* ============================================
     INIT CHARTS
     Charts render immediately. No IntersectionObserver, no fade-hidden.
     Canvas fills wrap via position:absolute (see reg-map.css).
     responsive:true + maintainAspectRatio:false handles the rest.
     ============================================ */
  function initCharts() {
    applyChartDefaults();

    buildSaaSChart();
    buildCountryChart();
    buildTimelineChart();
    buildSectorChart();
    buildRadarChart();
    buildMultiplesChart();
    buildExitTimeline();
  }

  /* --------------------------------------------------
     Chart 1: SaaS Valuation Compression
     Line chart with dashed ChatGPT annotation
     -------------------------------------------------- */
  function buildSaaSChart() {
    const ctx = document.getElementById('chart-saas').getContext('2d');
    const years  = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
    const values = [8.5,  11.0, 16.0, 20.0,  6.5,  6.0,  5.5,  4.2,  3.4];

    // Inline annotation plugin: draws a dashed vertical line at 2022 labeled "ChatGPT launch"
    const chatGPTAnnotation = {
      id: 'chatGPTLine',
      afterDraw(chart) {
        const xScale = chart.scales.x;
        const yScale = chart.scales.y;
        const idx    = years.indexOf(2022);
        if (idx < 0 || !xScale || !yScale) return;
        const x   = xScale.getPixelForValue(idx);
        const ctx2 = chart.ctx;
        ctx2.save();
        ctx2.strokeStyle = alpha(COLORS.pearl, 0.28);
        ctx2.lineWidth   = 1.5;
        ctx2.setLineDash([5, 5]);
        ctx2.beginPath();
        ctx2.moveTo(x, yScale.top);
        ctx2.lineTo(x, yScale.bottom);
        ctx2.stroke();
        ctx2.setLineDash([]);
        ctx2.fillStyle = alpha(COLORS.pearl, 0.45);
        ctx2.font      = `11px ${FONT_BODY}`;
        ctx2.textAlign = 'center';
        ctx2.fillText('ChatGPT launch', x, yScale.top - 8);
        ctx2.restore();
      }
    };

    chartInstances.saas = new Chart(ctx, {
      type: 'line',
      data: {
        labels: years.map(String),
        datasets: [{
          label:              'Median EV/NTM Revenue',
          data:               values,
          borderColor:        COLORS.tomato,
          backgroundColor:    alpha(COLORS.tomato, 0.08),
          fill:               true,
          tension:            0.35,
          pointBackgroundColor: COLORS.tomato,
          pointBorderColor:   COLORS.evergreen,
          pointBorderWidth:   2,
          pointRadius:        5,
          pointHoverRadius:   8,
        }]
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        animation:           { duration: 1000, easing: 'easeOutQuart' },
        scales: {
          y: {
            beginAtZero: true,
            max:         24,
            grid:        { color: COLORS.gridLine },
            ticks: {
              callback: v => v + 'x',
              color:    COLORS.pearlMuted,
            },
            title: {
              display: true,
              text:    'EV / NTM Revenue',
              color:   COLORS.pearlFaint,
              font:    { size: 11 },
            },
          },
          x: {
            grid:  { color: COLORS.gridLine },
            ticks: { color: COLORS.pearlMuted },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title:      items => `${items[0].label}`,
              label:      item  => `${item.raw}x EV/NTM Revenue`,
              afterLabel: ()    => 'Median for public SaaS companies',
              footer:     ()    => 'Source: Clouded Judgement, Meritech Capital (Feb 2026)',
            }
          }
        }
      },
      plugins: [chatGPTAnnotation],
    });
  }

  /* --------------------------------------------------
     Chart 2: Regulation Surface Area by Country
     Horizontal stacked bar (uses allRegs, not filtered)
     -------------------------------------------------- */
  function buildCountryChart() {
    const ctx = document.getElementById('chart-country').getContext('2d');
    const byCountry = {};
    allRegs.forEach(r => {
      if (!byCountry[r.country]) byCountry[r.country] = { t1: 0, t2: 0 };
      if (r.tier === 'T1') byCountry[r.country].t1++;
      else                  byCountry[r.country].t2++;
    });

    const sorted   = Object.entries(byCountry)
      .sort((a, b) => (b[1].t1 + b[1].t2) - (a[1].t1 + a[1].t2));
    const labels   = sorted.map(s => s[0]);
    const t1Data   = sorted.map(s => s[1].t1);
    const t2Data   = sorted.map(s => s[1].t2);
    const totals   = sorted.map(s => s[1].t1 + s[1].t2);

    chartInstances.country = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label:           'T1: Direct Moat',
            data:            t1Data,
            backgroundColor: COLORS.tomato,
            borderColor:     COLORS.tomato,
            borderWidth:     0,
            borderRadius:    2,
          },
          {
            label:           'T2: Indirect Moat',
            data:            t2Data,
            backgroundColor: alpha(COLORS.pearl, 0.18),
            borderColor:     alpha(COLORS.pearl, 0.35),
            borderWidth:     1,
            borderRadius:    2,
          }
        ]
      },
      options: {
        indexAxis:           'y',
        responsive:          true,
        maintainAspectRatio: false,
        animation:           { duration: 900, easing: 'easeOutQuart' },
        scales: {
          x: {
            stacked: true,
            grid:    { color: COLORS.gridLine },
            ticks:   { color: COLORS.pearlMuted },
            title: {
              display: true,
              text:    'Total Regulations',
              color:   COLORS.pearlFaint,
              font:    { size: 11 },
            },
          },
          y: {
            stacked: true,
            grid:    { display: false },
            ticks:   { color: COLORS.pearlMuted, font: { size: 11 } },
          }
        },
        plugins: {
          legend: {
            display:  true,
            position: 'top',
            labels:   {
              color:          COLORS.pearlMuted,
              font:           { size: 11 },
              usePointStyle:  true,
              pointStyle:     'rect',
              padding:        16,
            }
          },
          tooltip: {
            mode:      'y',
            intersect: false,
            callbacks: {
              title: items => `${items[0].label}  ·  ${totals[items[0].dataIndex]} total`,
              label: item  => {
                const v = item.raw;
                if (item.datasetIndex === 0) {
                  return `T1: ${v} | Direct Moat: Product requires government approval (12–36 months, $500K–$5M) to operate`;
                }
                return `T2: ${v} | Indirect Moat: Buyer is legally required to purchase compliant solutions`;
              }
            }
          }
        }
      }
    });
  }

  /* --------------------------------------------------
     Chart 3: Regulation Timeline
     Cumulative stacked area by status (uses allRegs)
     -------------------------------------------------- */
  function buildTimelineChart() {
    const ctx = document.getElementById('chart-timeline').getContext('2d');
    const years       = [];
    for (let y = 2019; y <= 2028; y++) years.push(y);

    const statusTypes  = ['enacted', 'in_parliament', 'expected'];
    const statusLabels = { enacted: 'Enacted', in_parliament: 'In Parliament', expected: 'Expected' };
    const statusExplain = {
      enacted:       'Law is passed and in force',
      in_parliament: 'Bill introduced, awaiting passage',
      expected:      'Announced or anticipated regulation',
    };
    const statusColors = {
      enacted:       { bg: COLORS.enactedBg,       border: COLORS.enacted },
      in_parliament: { bg: COLORS.inParliamentBg,   border: COLORS.inParliament },
      expected:      { bg: COLORS.expectedBg,        border: COLORS.expected },
    };

    const datasets = statusTypes.map(st => {
      let cumul = allRegs.filter(r => r.status === st && r.year != null && r.year < 2019).length;
      const data = years.map(y => {
        cumul += allRegs.filter(r => r.status === st && r.year === y).length;
        return cumul;
      });
      return {
        label:               statusLabels[st],
        data,
        backgroundColor:     statusColors[st].bg,
        borderColor:         statusColors[st].border,
        borderWidth:         2,
        fill:                true,
        tension:             0.3,
        pointRadius:         3,
        pointHoverRadius:    7,
        pointBackgroundColor: statusColors[st].border,
        pointBorderColor:    alpha(COLORS.evergreen, 0.8),
        pointBorderWidth:    1.5,
      };
    });

    chartInstances.timeline = new Chart(ctx, {
      type: 'line',
      data: { labels: years.map(String), datasets },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        animation:           { duration: 1100, easing: 'easeOutQuart' },
        scales: {
          y: {
            stacked: true,
            grid:    { color: COLORS.gridLine },
            ticks:   { color: COLORS.pearlMuted },
            title: {
              display: true,
              text:    'Cumulative Count',
              color:   COLORS.pearlFaint,
              font:    { size: 11 },
            },
          },
          x: {
            grid:  { color: COLORS.gridLine },
            ticks: { color: COLORS.pearlMuted },
          },
        },
        plugins: {
          legend: {
            display:  true,
            position: 'top',
            labels:   { color: COLORS.pearlMuted, font: { size: 11 }, usePointStyle: true, padding: 16 }
          },
          tooltip: {
            mode:      'index',
            intersect: false,
            callbacks: {
              title:  items => `Year ${items[0].label}`,
              label:  item  => {
                const st = statusTypes[item.datasetIndex];
                return `${statusLabels[st]}: ${item.raw}`;
              },
              afterLabel: item => {
                const st = statusTypes[item.datasetIndex];
                return `  ${statusExplain[st]}`;
              },
            }
          }
        }
      }
    });
  }

  /* --------------------------------------------------
     Chart 4: Sector Distribution Bubble Chart
     Uses allRegs. Bubble size = total, colour intensity = T1 ratio.
     -------------------------------------------------- */
  function buildSectorChart() {
    const ctx = document.getElementById('chart-sector').getContext('2d');

    const sectorData = {};
    allRegs.forEach(r => {
      if (!sectorData[r.sector]) sectorData[r.sector] = { total: 0, t1: 0, t2: 0 };
      sectorData[r.sector].total++;
      if (r.tier === 'T1') sectorData[r.sector].t1++;
      else                   sectorData[r.sector].t2++;
    });

    const sectors  = Object.keys(sectorData).sort((a,b) => sectorData[b].total - sectorData[a].total);
    const maxTotal = Math.max(...sectors.map(s => sectorData[s].total));

    // Deterministic grid layout: 4 columns, no randomness
    const cols = 4;
    const xStep = 22;
    const yStep = 28;

    const bubbles = sectors.map((s, i) => {
      const d       = sectorData[s];
      const t1Ratio = d.total > 0 ? d.t1 / d.total : 0;
      // Colour: low T1 = pearl, high T1 = tomato, interpolated from the token values
      const [cr, cg, cb] = mix(COLORS.pearl, COLORS.tomato, t1Ratio);
      const col = i % cols;
      const row = Math.floor(i / cols);
      return {
        x:        col * xStep + 11,
        y:        row * yStep + 14,
        r:        9 + (d.total / maxTotal) * 30,
        sector:   s,
        total:    d.total,
        t1:       d.t1,
        t2:       d.t2,
        t1Ratio,
        fill:     `rgba(${cr},${cg},${cb},0.65)`,
        stroke:   `rgb(${cr},${cg},${cb})`,
      };
    });

    // Sector label plugin (drawn after data)
    const labelPlugin = {
      id: 'bubbleLabels',
      afterDatasetsDraw(chart) {
        const ctx2 = chart.ctx;
        ctx2.save();
        const meta = chart.getDatasetMeta(0);
        meta.data.forEach((el, i) => {
          const pt = bubbles[i];
          if (!pt) return;
          ctx2.fillStyle   = alpha(COLORS.pearl, 0.75);
          ctx2.font        = `bold ${Math.min(10, Math.max(8, pt.r * 0.32))}px ${FONT_BODY}`;
          ctx2.textAlign   = 'center';
          ctx2.textBaseline = 'middle';
          // Split long names across two lines
          const words = pt.sector.split(' ');
          if (words.length <= 2 || pt.sector.length <= 14) {
            ctx2.fillText(pt.sector.length > 16 ? pt.sector.slice(0,14) + '…' : pt.sector, el.x, el.y);
          } else {
            const mid = Math.ceil(words.length / 2);
            ctx2.fillText(words.slice(0, mid).join(' '), el.x, el.y - 6);
            ctx2.fillText(words.slice(mid).join(' '), el.x, el.y + 6);
          }
        });
        ctx2.restore();
      }
    };

    chartInstances.sector = new Chart(ctx, {
      type: 'bubble',
      data: {
        datasets: [{
          data:          bubbles,
          backgroundColor:  bubbles.map(b => b.fill),
          borderColor:      bubbles.map(b => b.stroke),
          borderWidth:      1.5,
          hoverBorderWidth: 2.5,
          hoverBorderColor: COLORS.pearl,
        }]
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        animation:           { duration: 1100, easing: 'easeOutQuart' },
        scales: {
          x: { display: false, min: 0, max: cols * xStep },
          y: { display: false, min: -4, max: Math.ceil(sectors.length / cols) * yStep },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title:      items => items[0].raw.sector,
              label:      item  => {
                const d = item.raw;
                const t1Pct = (d.t1Ratio * 100).toFixed(0);
                return [
                  `Total: ${d.total} regulations`,
                  `T1: ${d.t1}  ·  T2: ${d.t2}`,
                  `T1 Ratio: ${t1Pct}%`,
                ];
              },
              afterBody: items => {
                const def = SECTOR_DEFS[items[0].raw.sector];
                return def ? ['', def] : [];
              }
            }
          }
        }
      },
      plugins: [labelPlugin],
    });
  }

  /* --------------------------------------------------
     Chart 5: Regional Comparison Radar
     Axes = SECTOR_GROUPS. Lines = regions. Uses allRegs.
     -------------------------------------------------- */
  function buildRadarChart() {
    const ctx         = document.getElementById('chart-radar').getContext('2d');
    const groupLabels = Object.keys(SECTOR_GROUPS);
    const regions     = ['OECD APAC', 'GCC', 'SE Asia', 'North America', 'Europe', 'South Asia', 'LATAM'];

    /* Seven region series on the near-black ground. The two brand colours stay; the other five
       resolve to hmm-region-01 to 05, ruled 2026-09-07 for this chart in the map's own order:
       each clears 4.5:1 on hmm-field-dark, which the legend text needs. */
    const regionColors = [
      { bg: alpha(COLORS.tomato, 0.12),  border: COLORS.tomato },
      { bg: alpha(COLORS.region01, 0.1), border: COLORS.region01 },
      { bg: alpha(COLORS.region02, 0.1), border: COLORS.region02 },
      { bg: alpha(COLORS.region03, 0.1), border: COLORS.region03 },
      { bg: alpha(COLORS.pearl, 0.08),   border: COLORS.pearl },
      { bg: alpha(COLORS.region04, 0.1), border: COLORS.region04 },
      { bg: alpha(COLORS.region05, 0.1), border: COLORS.region05 },
    ];

    const datasets = regions.map((region, ri) => {
      const data = groupLabels.map(group => {
        const sectors = SECTOR_GROUPS[group];
        return allRegs.filter(r => r.region === region && sectors.includes(r.sector)).length;
      });
      return {
        label:               region,
        data,
        backgroundColor:     regionColors[ri].bg,
        borderColor:         regionColors[ri].border,
        borderWidth:         2,
        pointBackgroundColor: regionColors[ri].border,
        pointBorderColor:    alpha(COLORS.evergreen, 0.6),
        pointBorderWidth:    1.5,
        pointRadius:         3,
        pointHoverRadius:    7,
      };
    });

    chartInstances.radar = new Chart(ctx, {
      type: 'radar',
      data: { labels: groupLabels, datasets },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        animation:           { duration: 1100, easing: 'easeOutQuart' },
        scales: {
          r: {
            grid:        { color: COLORS.gridLineBright },
            angleLines:  { color: COLORS.gridLine },
            ticks:       { display: false, backdropColor: 'transparent' },
            pointLabels: {
              color: COLORS.pearlMuted,
              font:  { size: 11, family: FONT_BODY },
            }
          }
        },
        plugins: {
          legend: {
            display:  true,
            position: 'bottom',
            labels:   {
              color:         COLORS.pearlMuted,
              font:          { size: 11 },
              usePointStyle: true,
              padding:       16,
            }
          },
          tooltip: {
            callbacks: {
              title: items => items[0].dataset.label,
              label: item  => {
                const group   = groupLabels[item.dataIndex];
                const sectors = SECTOR_GROUPS[group];
                return `${group}: ${item.raw} regulations  (${sectors.join(', ')})`;
              }
            }
          }
        }
      }
    });
  }

  /* --------------------------------------------------
     Chart 6: Regulated vs Unregulated Multiples
     Bar chart with 3 bars. Uses static data.
     -------------------------------------------------- */
  function buildMultiplesChart() {
    const ctx = document.getElementById('chart-multiples').getContext('2d');

    chartInstances.multiples = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Regulated Software\n(Low)', 'Regulated Software\n(High)', 'Standard SaaS\n(Median)'],
        datasets: [{
          data:              [14, 17, 5.1],
          backgroundColor:   [COLORS.tomato, COLORS.tomato, alpha(COLORS.pearl, 0.15)],
          borderColor:       [COLORS.tomato, COLORS.tomato, alpha(COLORS.pearl, 0.35)],
          borderWidth:       [0, 0, 1],
          borderRadius:      4,
          barPercentage:     0.5,
          categoryPercentage: 0.6,
        }]
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        animation:           { duration: 900, easing: 'easeOutQuart' },
        scales: {
          y: {
            beginAtZero: true,
            max:         22,
            grid:        { color: COLORS.gridLine },
            ticks:       { callback: v => v + 'x', color: COLORS.pearlMuted },
            title: {
              display: true,
              text:    'EV / Revenue',
              color:   COLORS.pearlFaint,
              font:    { size: 11 },
            },
          },
          x: {
            grid:  { display: false },
            ticks: { color: COLORS.pearlMuted, font: { size: 11 } },
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: items => items[0].label.replace('\n', ' '),
              label: item  => {
                const v = item.raw;
                if (item.dataIndex < 2) {
                  return `${v}x EV/Revenue | regulated-sector software commands a 3–4x premium`;
                }
                return `${v}x EV/Revenue | median for public SaaS companies`;
              },
              footer: () => 'Source: Pitchbook, Bain Capital (2025)',
            }
          }
        }
      }
    });
  }

  /* --------------------------------------------------
     Chart 7: Exit Evidence (Card layout, no canvas)
     -------------------------------------------------- */
  function buildExitTimeline() {
    const exits = [
      {
        year:    2024,
        company: 'Payapps',
        outcome: 'Acquired by Autodesk, ~USD $390M',
        detail:  'AU/NZ origin. Construction payment compliance platform built on Security of Payments Act compliance. T2 moat: buyers are legally required to comply with state-level payment regulations. Autodesk acquired the regulatory infrastructure, not just the software.',
        tier:    'T2',
        market:  'AU / NZ',
      },
      {
        year:    2024,
        company: 'Volpara Health',
        outcome: 'Acquired by Lunit, ~A$292M (USD $193M)',
        detail:  'NZ origin. AI breast cancer screening with FDA 510(k), TGA clearance, and CE Mark. T1 moat: multi-jurisdiction regulatory approvals that took years to obtain. Each clearance is a temporal monopoly no competitor can shortcut.',
        tier:    'T1',
        market:  'NZ',
      },
      {
        year:    2024,
        company: 'SafetyCulture',
        outcome: 'A$2.5B valuation',
        detail:  'AU origin. Workplace safety compliance platform serving 85,000 businesses. T2 moat: WHS Act compliance mandates create legal switching costs. Employers cannot risk non-compliance with safety regulations.',
        tier:    'T2',
        market:  'AU',
      },
      {
        year:    2025,
        company: 'Lumus Imaging',
        outcome: 'Acquired by Affinity Equity Partners, ~A$965M',
        detail:  'AU origin. TGA-regulated diagnostic imaging and NATA-accredited pathology services. T1 moat: regulatory accreditation and device approvals form the barrier to entry that drove the acquisition premium.',
        tier:    'T1',
        market:  'AU',
      },
    ];

    const container = document.getElementById('exit-timeline');
    exits.forEach(exit => {
      const card = document.createElement('div');
      card.className   = 'exit-card-item';
      card.setAttribute('role', 'listitem');
      card.innerHTML = `
        <div class="exit-year-marker" aria-hidden="true">${esc(exit.year)}</div>
        <div class="exit-card-content">
          <div class="exit-card-header">
            <span class="exit-card-company">${esc(exit.company)}</span>
            <span class="badge badge--${esc(exit.tier.toLowerCase())}">${esc(exit.tier)}</span>
            <span class="badge badge--market">${esc(exit.market)}</span>
          </div>
          <div class="exit-card-outcome">${esc(exit.outcome)}</div>
          <div class="exit-card-detail">${esc(exit.detail)}</div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  /* ============================================
     BOOT
     ============================================ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
