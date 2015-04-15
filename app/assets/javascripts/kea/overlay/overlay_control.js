(function(app, ko) {
  "use strict";

  var OverlayControl,
      Overlay;

  OverlayControl = function OverlayControl() {
    var that = this;
    
    this.providers = {};
    this.existingOverlays = {};
    
    this.registerProvider = function registerProvider(name, createCallback) {
      that.providers[name] = createCallback;
    };
    
    this.createOverlay = function createOverlay(name, ctx, ctxExtension, overlayOptions) {
      var overlay;
      
      if (DEBUG) { console.assert(that.providers[name], "%s is not an available overlay provider", name); }
      
      if (that.existingOverlays[name]) {
        overlay = that.existingOverlays[name];
        
        overlay.update(ctx, ctxExtension);
        
      } else {
        overlay = that.providers[name](ctx, ctxExtension, overlayOptions);
        
        that.existingOverlays[name] = overlay;
      }
      
      return overlay;
    };
  };
  
  Overlay = function Overlay(name, veil) {
    var that = this;
    
    this.name = name;
    this.veil = veil;
    
    this.updateCallback  = function noop() {};
    this.destroyCallback = function noop() {};
    
    this.callbacks = {
      'beforeShow' : [],
      'beforeClose': []
    };
    
    this.runCallbacks = function runCallbacks(name) {
      that.callbacks[name].forEach(function(callback) {
        callback.apply(that);
      });
    };
    
    this.on = function on(callbackName, callback) {
      that.callbacks[callbackName].push(callback);
    };
    
    this.update = function update() {
      that.updateCallback.apply(that, arguments);
    };
    
    this.destroy = function destroy() {
      that.runCallbacks('beforeClose');
      that.destroyCallback.apply(that, arguments);
    };
    
    this.show = function show() {
      that.runCallbacks('beforeShow');
      that.veil.show();
    };
    
    this.hide = function hide() {
      // that.runCallbacks('beforeClose');
      // that.veil.hide();
      that.hideAndRemove();
    };
    
    this.hideAndRemove = function hideAndRemove() {
      that.runCallbacks('beforeClose');
      that.veil.addCallback('afterHide', function() {
        that.veil.destroy();
      });
      that.veil.hide();
    };
    
  };
  
  window.Overlay = {
    control: new OverlayControl(),
    Overlay: Overlay
  };

})(window.app, ko);