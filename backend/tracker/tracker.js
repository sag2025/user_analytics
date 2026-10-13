/*! Standalone analytics tracker. Independent of the React app.
 *  <script src="https://YOUR-API/tracker/tracker.js" data-session-id="SESSION_ID"></script>
 *  If data-session-id is omitted it reads localStorage "ca_session_id".
 *  data-endpoint overrides the API url (defaults to the origin that served this script).
 */
(function () {
  var script = document.currentScript;
  var sessionId = (script && script.getAttribute('data-session-id')) || get('ca_session_id');
  if (!sessionId) return;
  var endpoint = (script && script.getAttribute('data-endpoint')) ||
    (script && script.src ? new URL(script.src).origin + '/api/events' : '/api/events');
  var current = { url: pageUrl(), start: Date.now() };

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function pageUrl() { return location.origin + location.pathname; }

  function send(event, beacon) {
    var body = JSON.stringify(event);
    // text/plain avoids a CORS preflight and survives page unloads
    if (beacon && navigator.sendBeacon && navigator.sendBeacon(endpoint, new Blob([body], { type: 'text/plain' }))) return;
    fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: body, keepalive: true }).catch(function () {});
  }

  function track(type, extra, beacon) {
    var e = { session_id: sessionId, type: type, url: pageUrl(), timestamp: new Date().toISOString() };
    for (var k in extra) e[k] = extra[k];
    send(e, beacon);
  }

  track('page_view');

  document.addEventListener('click', function (ev) {
    var d = document.documentElement;
    track('click', {
      x: Math.round(ev.pageX), y: Math.round(ev.pageY),
      page_width: Math.max(d.scrollWidth, d.clientWidth),
      page_height: Math.max(d.scrollHeight, d.clientHeight)
    });
  }, true);

  window.addEventListener('pagehide', function () {
    send({ session_id: sessionId, type: 'page_leave', url: current.url,
           timestamp: new Date().toISOString(), duration_ms: Date.now() - current.start }, true);
  });
})();
