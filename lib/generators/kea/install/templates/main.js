(function(app, kea, ko) {
  "use strict";

  var Main = function Main() {
    kea.viewmodels.Parent.apply(this);

    var that = this;

    this._viewmodelName = function _viewmodelName() { return "Main"; };
    
    // this.listener = new window.keypress.Listener();
    
    this.pageInitComplete = ko.observable(false);
  };

  app.viewmodels.Main = Main;

})(window.app, window.kea, ko);