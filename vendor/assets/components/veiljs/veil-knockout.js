// Expose plugin as an AMD module if AMD loader is present:
(function (factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    define(['knockout', 'jquery'], factory);
  } else {
    window.ko.bindingHandlers.veil = factory(ko, jQuery);
  }

}(function (ko, $) {
  'use strict';

  /**
   * A Knockout binding handler for Veil
   *
   * @global
   */
  var veil = {
    /** @lends ko.bindingHandlers.veil */
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var $element        = $(element),
          veilTemplate    = allBindingsAccessor().veilTemplate,
          veilOptions     = allBindingsAccessor().veilOptions || {},
          contentCallback;

      contentCallback = function(overlay) {
        ko.renderTemplate(veilTemplate, valueAccessor(), {}, overlay.get(0));
      };

      $element.veil(veilOptions);
      $element.veil().addCallback('afterCreate', contentCallback);

      $element.on('click', function(ev) {
        if ($element.veil().isActive()) {
          $element.veil().hide();
        } else {
          $element.veil().show();
        }

        ev.stopPropagation();
      });

      ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
        try {
          $(element).veil().destroy();
        } catch (e) {
          
        }
      });
    }
  };

  return veil;
}));