(function(ko, $) {
  "use strict";

  ko.bindingHandlers.dropdown = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var $element        = $(element),
          templateName    = ko.unwrap(valueAccessor()),
          dropdownContext = allBindingsAccessor().dropdownContext || bindingContext,
          options,
          defaultOptions,
          contentCallback;

      defaultOptions = {
        allowParallelUse: false,
        appendTo: 'afterElement',
        popoverClass: '',
        position: 'center bottom'
      };
      
      options = $.extend({}, defaultOptions, allBindingsAccessor().attacheOptions);
      options.popoverClass = options.popoverClass + ' dropdown';

      contentCallback = function(anchor, popover) {
        ko.renderTemplate(templateName, dropdownContext, {}, popover.get(0));
      };

      $element.attache(options);
      $element.attache().addCallback('afterCreate', contentCallback);

      $element.on('click', function(ev) {
        if ($element.attache().isActive()) {
          $element.attache().hide();
        } else {
          $element.attache().show();
          $('body').one('click', function() { $element.attache().hide(); } );
        }

        ev.stopPropagation();
      });

      ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
        try {
          $(element).attache().destroy();
        } catch (e) {
          
        }
      });
    }
  };

})(ko, $);