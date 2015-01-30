(function(app, ko) {
  "use strict";

  var Main = function Main() {
    app.viewmodels.Parent.apply(this);

    var that = this;

    this._viewmodelName = function _viewmodelName() { return "Main"; };
    
    this.pageInitComplete = ko.observable(false);
  };

  app.viewmodels.Main = Main;

})(window.app, ko);