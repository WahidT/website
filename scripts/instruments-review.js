/* Review harness script for instruments.html. Mounts each instrument machine in both
   forms. Lives under scripts/ rather than at the root
   because check:deadjs probes every root script's selector literals against the five
   site routes, and these selectors only exist on the harness page. */
(function () {
  ["implant", "anode", "energiser"].forEach(function (kind) {
    HMM.renderBlowout(document.querySelector('.machine-wrap[data-blowout="' + kind + '"]'), kind);
    HMM.renderIcon(document.querySelector('.ins-icon[data-icon="' + kind + '"]'), kind);
  });
})();
