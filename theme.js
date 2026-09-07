/* hmm site - the one place tokens are read from and the one place a theme
   change is heard. Loaded before every script that draws in colour.

   __T(name, fallback) reads a custom property off <html> at the moment it is
   called. Every drawing reads it at render, never at load, because a value
   captured at load is stale the moment data-theme flips. The fallback is the
   dark-theme hex and is only reached when the tokens stylesheet has not
   arrived; it is written beside the token name so a reader sees both.

   __onTheme(fn) runs fn after each data-theme flip on <html>, which is the
   whole theme mechanism on this site. Renders that read tokens register here
   and run again; the first paint is the same call at a later moment, so
   nothing changes until the theme does. It returns a disposer that disconnects
   the observer, so a caller inside a render path that re-registers on every
   render can release the previous one instead of stacking observers that each
   redraw the same node. The three page-level callers register once and never
   dispose; where MutationObserver is absent the disposer is a no-op.

   These two used to be pasted into sections.js, machines.js and radars.js;
   three copies drift, and ai-figures.js carried a fourth under another name. */
function __T(n, fallback) {
  var v = getComputedStyle(document.documentElement).getPropertyValue(n);
  return (v && v.trim()) || fallback;
}
function __onTheme(fn) {
  if (typeof MutationObserver !== "function") return function () {};
  var mo = new MutationObserver(function (ms) {
    for (var i = 0; i < ms.length; i++) if (ms[i].attributeName === "data-theme") { fn(); return; }
  });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return function () { mo.disconnect(); };
}
