
// Expose plugin as an AMD module if AMD loader is present:
(function (factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else {
    factory(jQuery);
  }

}(function ($) {
  'use strict';

  function ActivityButton(button) {
    this.$button    = $(button);
    this.isOn       = false;
    this.iconCache  = null;
  }

  ActivityButton.prototype = (function() {

    var on, off, active;

    on = function on() {
      if (this.isOn) {
        return false;
      }

      var existingIcon = this.$button.find('[class^="icon-"]');

      if (existingIcon.length > 0) {
        this.iconCache = existingIcon.remove();
      }

      this.$button.prepend("<i class='icon-spin3 animate-spin'></i>");

      this.isOn = true;
    };

    off = function off() {
      if (!this.isOn) {
        return false;
      }

      this.$button.find('.icon-spin3').remove();

      if (this.iconCache) {
        this.$button.prepend(this.iconCache);
        this.iconCache = null;
      }

      this.isOn = false;
    };
    
    active = function active() {
      return this.isOn;
    };

    return {
      on: on,
      off: off,
      active: active
    };
  })();

  // Create chainable jQuery plugin:
  $.fn.activityButton = function (optionsOrFnName, args) {
    var dataKey = 'activityButton';

    // If function invoked without argument return
    // instance of the first matched element
    if (arguments.length === 0 && this.first().data(dataKey)) {
      return this.first().data(dataKey);
    }

    return this.each(function () {
      var inputElement  = $(this),
          instance      = inputElement.data(dataKey);

      if (typeof optionsOrFnName === 'string') {
        if (instance && typeof instance[optionsOrFnName] === 'function') {
          instance[optionsOrFnName](args);
        }

      } else {
        // If instance already exists, destroy it:
        if (instance && instance.dispose) {
          instance.dispose();
        }

        instance = new ActivityButton(this, optionsOrFnName);
        inputElement.data(dataKey, instance);
      }
    });
  };
}));