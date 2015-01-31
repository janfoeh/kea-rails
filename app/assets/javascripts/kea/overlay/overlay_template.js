(function(ko, $, Veil, Overlay) {
  "use strict";

  ko.bindingHandlers.overlayTemplate = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var $container  = $(element),
          name        = ko.unwrap(valueAccessor()),
          newCtx,
          createCallback;
      
      // returns either current context extended, or an
      // extended child context
      newCtx = function newCtx(overlay, ctx, ctxExtension) {
        if (ctxExtension) {
          return ctx.createChildContext(
            ctxExtension,
            null, // optional alias for $data
            function(context) {
                ko.utils.extend(context, { overlay: overlay} );
            });
        } else {
          return ctx.extend({ overlay: overlay});
        }
      };
      
      createCallback = function createCallback(ctx, ctxExtension, veilOptions) {
        var veil      = new Veil(veilOptions),
            overlay   = new Overlay.Overlay(name, veil),
            childCtx  = newCtx(overlay, ctx, ctxExtension);
        
        ko.bindingHandlers.template.init(veil.overlay().get(0), function() { return name; }, allBindingsAccessor, childCtx.$data, childCtx);
        ko.bindingHandlers.template.update(veil.overlay().get(0), function() { return name; }, allBindingsAccessor, childCtx.$data, childCtx);
        
        overlay.updateCallback = function updateCallback(ctx, ctxExtension) {
          var updatedCtx = newCtx(this, ctx, ctxExtension);
          
          ko.bindingHandlers.template.update(veil.overlay().get(0), function() { return name; }, allBindingsAccessor, updatedCtx.$data, updatedCtx);
        };
        
        overlay.destroyCallback = function destroyCallback() {
          ko.virtualElements.emptyNode( veil.overlay().get(0) );
          veil.destroy();
        };
        
        return overlay;
      };
      
      Overlay.control.registerProvider(name, createCallback);
      
      ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
        // listener.destroy();
      });
      
      return {controlsDescendantBindings: true};
    }
  };

})(ko, $, window.Veil, window.Overlay);