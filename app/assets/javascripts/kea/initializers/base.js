(function(app, ko, $) {
  "use strict";

  app.initialize_on = function initialize_on() {
    var selectors = Array.prototype.slice.call(arguments),
        callback  = selectors.pop();
    
    app.initializers.push({selectors: selectors, callback: callback});
  };
})(window.app, ko, $);

