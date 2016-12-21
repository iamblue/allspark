chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {
    frame: {
      type: 'none',
    },
    resizable: false,
    bounds: {
      width: 1024,
      height: 728,
    },
  });
});
