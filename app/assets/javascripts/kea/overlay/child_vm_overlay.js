(function(ko, $, Veil, Overlay, app) {
  "use strict";

  ko.bindingHandlers.childVmOverlay = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var $element        = $(element),
          options         = ko.unwrap(valueAccessor()),
          overlayName     = ko.unwrap(options.name),
          vmName          = ko.unwrap(options.vm),
          parentVm        = options.parentVm || bindingContext.$parent,
          setup           = options.setup,
          overlayOptions  = options.overlayOptions || {},
          css             = options.css;
      
      overlayOptions.overlayClass = [overlayOptions.overlayClass, overlayName, css].join(' ');
          
      $element.on('click', function() {
        var childVm = parentVm.getVm(vmName),
            overlay;
        
        if (childVm.setup) {
          childVm.setup(setup);
        }
        
        overlay = Overlay.control.createOverlay(overlayName, bindingContext, childVm, overlayOptions);
        
        if (childVm.keyboardHandlerConfigs) {
          childVm.keyboardHandlerConfigs.forEach(function(config) {
            childVm.keyboardHandlers.push( app.page.MainVm.listener.register_combo(config) );
          });
          
          overlay.on('beforeClose', function() {
            app.page.MainVm.listener.unregister_many(childVm.keyboardHandlers);
            childVm.keyboardHandlers.length = 0;
          });
        }
        
        if (childVm.exit) {
          childVm.exit.subscribe(function() {
            overlay.hide();
          });
        }
        
        overlay.show();
      });
    }
  };

})(ko, $, window.Veil, window.Overlay, window.app);