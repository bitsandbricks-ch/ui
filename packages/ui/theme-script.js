// Paints the page in the saved light or dark scheme before the app loads, so a dark-mode user sees
// no white flash. Load it in <head> as a file (an inline script would need a CSP exception):
//   <script src="/theme.js" data-cookie="bnb_theme"></script>
// Same rules as createColorSchemeManager: the cookie, else Mantine's localStorage, else the device.
;(function () {
  var script = document.currentScript
  var name = (script && script.getAttribute('data-cookie')) || 'bnb_theme'
  var value = (document.cookie.match(new RegExp('(?:^|; )' + name + '=(light|dark|auto)')) || [])[1]
  if (!value) {
    try {
      value = localStorage.getItem('mantine-color-scheme-value') || 'auto'
    } catch {
      value = 'auto'
    }
  }
  if (value !== 'light' && value !== 'dark') {
    value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  document.documentElement.setAttribute('data-mantine-color-scheme', value)
})()
