(function(ko, $, Veil, Overlay, app) {
  "use strict";

  ko.bindingHandlers.closeOverlay = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var $element        = $(element);
      
      $element.on('click', function() {
        bindingContext.overlay.hide();
      });
    }
  };

})(ko, $, window.Veil, window.Overlay, window.app);