/* ============================================================
   Vamshi Aitharaju — Portfolio
   Interactions: hero chart, season toggle, typewriter,
   count-up stats, scroll reveal.
   All real data, recreated from the NYC Air Quality project.
   ============================================================ */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------
     Real datasets — extracted from the actual NYC Air Quality
     Power BI dashboards & Python trend chart. Averages match the
     documented KPI values (e.g. winter NO2 25.4, summer O3 30.7).
     Concentrations in µg/m³ (O3 as index units), 2009–2023.
     ---------------------------------------------------------- */
  var YEARS = [2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023];

  var DATA = {
    annual: {
      sub: "Annual average · 2009–2023 · µg/m³",
      accent: "#F5A623",
      series: [
        { name: "Nitrogen dioxide (NO₂)", color: "accent",
          values: [24.9,25.7,22.6,22.4,23.1,21.0,20.0,20.8,20.3,18.4,20.1,17.1,17.1,16.6,13.3] },
        { name: "Fine particles (PM2.5)", color: "#7C8AA5",
          values: [10.9,12.7,10.8,10.9,11.5,9.4,9.2,8.4,9.0,8.2,8.1,7.1,7.9,6.6,9.0] }
      ]
    },
    winter: {
      sub: "Winter average · 2009–2023 · µg/m³",
      accent: "#2DD4BF",
      series: [
        { name: "Nitrogen dioxide (NO₂)", color: "accent",
          values: [31,27,31,25,26,28,25,24,26,23,22,25,22,22,21] },
        { name: "Fine particles (PM2.5)", color: "#8E7CC3",
          values: [14,11,13,10,11,12,10,9,9,8,8,9,8,7,6] }
      ]
    },
    summer: {
      sub: "Summer average · 2009–2023 · O₃ included",
      accent: "#FF8A5B",
      series: [
        { name: "Ozone (O₃)", color: "#7FB3E0",
          values: [24.5,32,31.5,33,30,30.5,31,33,29,30,29.8,29.8,30,33.5,34.5] },
        { name: "Nitrogen dioxide (NO₂)", color: "accent",
          values: [22.5,21,20.5,19,18,16.5,16,15.5,15.7,14.5,15,12.3,12.8,12,13.3] },
        { name: "Fine particles (PM2.5)", color: "#8E7CC3",
          values: [11,12,11.5,10.7,10.5,9,9.8,8.5,9.5,8.5,8,7,8.8,6.7,9.0] }
      ]
    }
  };

  var Y_MAX = 36;          // shared axis for honest season comparison
  var SVG_NS = "http://www.w3.org/2000/svg";

  // Plot geometry (matches SVG viewBox 0 0 640 340)
  var VW = 640, VH = 340;
  var M = { top: 16, right: 18, bottom: 30, left: 34 };
  var PW = VW - M.left - M.right;
  var PH = VH - M.top - M.bottom;

  var svg = document.getElementById("heroChart");
  var legendEl = document.getElementById("chartLegend");
  var subEl = document.getElementById("chartSub");

  function xPos(i) { return M.left + (PW * i) / (YEARS.length - 1); }
  function yPos(v) { return M.top + PH - (PH * v) / Y_MAX; }

  function el(tag, attrs) {
    var e = document.createElementNS(SVG_NS, tag);
    for (var k in attrs) { if (attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]); }
    return e;
  }

  function resolveColor(c, accent) { return c === "accent" ? accent : c; }

  function buildStatic(accent) {
    // Axes + gridlines + labels — drawn once, not animated away.
    var g = el("g", {});

    // Horizontal gridlines
    var ticks = [0, 9, 18, 27, 36];
    ticks.forEach(function (t) {
      var y = yPos(t);
      g.appendChild(el("line", { class: "grid-line", x1: M.left, y1: y, x2: VW - M.right, y2: y }));
      var lbl = el("text", { class: "axis-label", x: M.left - 8, y: y + 3, "text-anchor": "end" });
      lbl.textContent = t;
      g.appendChild(lbl);
    });

    // Baseline
    g.appendChild(el("line", { class: "axis-line", x1: M.left, y1: yPos(0), x2: VW - M.right, y2: yPos(0) }));

    // X labels (every ~3 years to avoid clutter)
    [0, 3, 6, 9, 12, 14].forEach(function (i) {
      var t = el("text", { class: "axis-label", x: xPos(i), y: VH - 10, "text-anchor": "middle" });
      t.textContent = YEARS[i];
      g.appendChild(t);
    });

    return g;
  }

  function linePath(values) {
    var d = "";
    for (var i = 0; i < values.length; i++) {
      d += (i === 0 ? "M" : "L") + xPos(i).toFixed(2) + "," + yPos(values[i]).toFixed(2) + " ";
    }
    return d.trim();
  }

  function areaPath(values) {
    var d = "M" + xPos(0).toFixed(2) + "," + yPos(0).toFixed(2) + " ";
    for (var i = 0; i < values.length; i++) {
      d += "L" + xPos(i).toFixed(2) + "," + yPos(values[i]).toFixed(2) + " ";
    }
    d += "L" + xPos(values.length - 1).toFixed(2) + "," + yPos(0).toFixed(2) + " Z";
    return d;
  }

  var currentSeason = "annual";
  var drawToken = 0;

  function render(season, animate) {
    var conf = DATA[season];
    var accent = conf.accent;
    drawToken++;
    var myToken = drawToken;

    // Update accent + subtitle
    document.documentElement.style.setProperty("--accent", accent);
    document.documentElement.style.setProperty("--accent-soft", hexToRgba(accent, 0.14));
    document.documentElement.style.setProperty("--accent-line", hexToRgba(accent, 0.34));
    subEl.textContent = conf.sub;

    // Clear
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    // Re-append accessibility title/desc
    svg.appendChild(makeTitle(season, conf));

    svg.appendChild(buildStatic(accent));

    // Draw each series (reverse so first series sits on top)
    var defs = el("defs", {});
    svg.appendChild(defs);

    conf.series.slice().reverse().forEach(function (s, idx) {
      var color = resolveColor(s.color, accent);
      var seriesIndex = conf.series.length - 1 - idx;

      // Soft area under the primary (accent) line only — evokes the confidence band
      if (s.color === "accent") {
        var gradId = "area-" + season + "-" + seriesIndex;
        var grad = el("linearGradient", { id: gradId, x1: "0", y1: "0", x2: "0", y2: "1" });
        grad.appendChild(el("stop", { offset: "0%", "stop-color": color, "stop-opacity": "0.22" }));
        grad.appendChild(el("stop", { offset: "100%", "stop-color": color, "stop-opacity": "0" }));
        defs.appendChild(grad);
        var area = el("path", { class: "series-area", d: areaPath(s.values), fill: "url(#" + gradId + ")" });
        area.style.opacity = "0";
        svg.appendChild(area);
        if (animate && !reduceMotion) {
          area.style.transition = "opacity 0.8s ease 0.6s";
          requestAnimationFrame(function () { if (myToken === drawToken) area.style.opacity = "1"; });
        } else {
          area.style.opacity = "1";
        }
      }

      // The line
      var path = el("path", { class: "series-path", d: linePath(s.values), stroke: color });
      svg.appendChild(path);

      // Dots
      var dotsG = el("g", {});
      s.values.forEach(function (v, i) {
        var c = el("circle", { class: "series-dot", cx: xPos(i), cy: yPos(v), r: 2.6, fill: color });
        dotsG.appendChild(c);
      });
      svg.appendChild(dotsG);

      if (animate && !reduceMotion) {
        var len = path.getTotalLength();
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;
        // stagger series slightly
        var delay = seriesIndex * 0.18;
        dotsG.style.opacity = "0";
        // Force reflow then animate
        path.getBoundingClientRect();
        path.style.transition = "stroke-dashoffset 1.5s cubic-bezier(0.5,0,0.2,1) " + delay + "s";
        dotsG.style.transition = "opacity 0.5s ease " + (delay + 1.2) + "s";
        requestAnimationFrame(function () {
          if (myToken !== drawToken) return;
          path.style.strokeDashoffset = "0";
          dotsG.style.opacity = "1";
        });
      }
    });

    // Legend
    renderLegend(conf, accent);
  }

  function makeTitle(season, conf) {
    var g = el("g", {});
    var t = el("title", {}); t.textContent = "NYC air quality — " + season + " trend, 2009–2023";
    var d = el("desc", {});
    d.textContent = conf.series.map(function (s) {
      return s.name + " from " + s.values[0] + " to " + s.values[s.values.length - 1];
    }).join("; ") + ".";
    g.appendChild(t); g.appendChild(d);
    return g;
  }

  function renderLegend(conf, accent) {
    legendEl.innerHTML = "";
    conf.series.forEach(function (s) {
      var color = resolveColor(s.color, accent);
      var item = document.createElement("span");
      item.className = "legend-item";
      var sw = document.createElement("span");
      sw.className = "legend-swatch";
      sw.style.background = color;
      var label = document.createElement("span");
      label.textContent = s.name;
      item.appendChild(sw); item.appendChild(label);
      legendEl.appendChild(item);
    });
  }

  function hexToRgba(hex, a) {
    var h = hex.replace("#", "");
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var r = parseInt(h.substring(0,2),16),
        g = parseInt(h.substring(2,4),16),
        b = parseInt(h.substring(4,6),16);
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
  }

  /* ---------- Season toggle ---------- */
  var segBtns = Array.prototype.slice.call(document.querySelectorAll(".seg__btn"));
  segBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var season = btn.getAttribute("data-season");
      if (season === currentSeason) return;
      currentSeason = season;
      segBtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
      render(season, true);
    });
  });

  /* ---------- Typewriter tagline ---------- */
  function typewriter() {
    var host = document.getElementById("tagline");
    var textEl = document.getElementById("taglineText");
    var cursor = document.getElementById("taglineCursor");
    var full = host.getAttribute("aria-label");

    if (reduceMotion) {
      textEl.textContent = full;
      if (cursor) cursor.style.display = "none";
      return;
    }

    var i = 0;
    function step() {
      if (i <= full.length) {
        textEl.textContent = full.slice(0, i);
        i++;
        // vary speed a touch for a natural terminal feel
        var ch = full[i - 2];
        var delay = (ch === "," || ch === ".") ? 220 : 18 + Math.random() * 26;
        setTimeout(step, delay);
      } else {
        cursor.classList.add("is-done");
      }
    }
    setTimeout(step, 550);
  }

  /* ---------- Count-up stats ---------- */
  function animateCount(node) {
    var target = parseFloat(node.getAttribute("data-count"));
    var decimals = parseInt(node.getAttribute("data-decimals") || "0", 10);
    var suffix = node.getAttribute("data-suffix") || "";
    var prefix = node.getAttribute("data-prefix") || "";
    var comma = node.getAttribute("data-format") === "comma";

    function fmt(v) {
      var s = decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString();
      if (comma) s = Number(decimals > 0 ? v.toFixed(decimals) : Math.round(v)).toLocaleString("en-US");
      return prefix + s + suffix;
    }

    if (reduceMotion) { node.textContent = fmt(target); return; }

    var dur = 1500, start = null;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      // easeOutExpo
      var eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      node.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(frame);
      else node.textContent = fmt(target);
    }
    requestAnimationFrame(frame);
  }

  var statsSeen = false;
  var statObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !statsSeen) {
        statsSeen = true;
        document.querySelectorAll(".stat__num").forEach(animateCount);
        statObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });
  var statsSection = document.getElementById("stats");
  if (statsSection) statObserver.observe(statsSection);

  /* ---------- Reveal on scroll ---------- */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(function (n) { revealObserver.observe(n); });

  /* ---------- Nav: scrolled state + mobile toggle ---------- */
  var nav = document.getElementById("nav");
  window.addEventListener("scroll", function () {
    if (window.scrollY > 12) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  }, { passive: true });

  var navToggle = document.getElementById("navToggle");
  var navMobile = document.getElementById("navLinksMobile");
  navToggle.addEventListener("click", function () {
    var open = navMobile.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  navMobile.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      navMobile.classList.remove("is-open");
      navToggle.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- Footer date ---------- */
  var footerDate = document.getElementById("footerDate");
  if (footerDate) {
    var now = new Date();
    footerDate.textContent = now.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  /* ---------- Init ---------- */
  // Render immediately (static) so the chart is never blank.
  render("annual", false);

  // The chart now lives in the Projects section, so draw it in when it
  // scrolls into view rather than on page load.
  var chartAnimated = false;
  var chartObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !chartAnimated) {
        chartAnimated = true;
        // Only replay the draw-in if the user hasn't already switched seasons.
        if (currentSeason === "annual") render("annual", true);
        chartObserver.disconnect();
      }
    });
  }, { threshold: 0.35 });
  if (svg) chartObserver.observe(svg);

  // Typewriter tagline runs on load (it's in the hero, above the fold).
  window.addEventListener("load", typewriter);

})();
