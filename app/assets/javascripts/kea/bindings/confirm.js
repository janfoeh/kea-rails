(function(ko, $) {
  "use strict";

  ko.bindingHandlers.confirm = {
    preprocess: function(value, name, addBinding) {
      addBinding('attacheOptions', "{popoverClass: 'confirm'}");
      
      return value;
    },
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var $element          = $(element),
          onConfirmCallback = ko.unwrap(valueAccessor()),
          confirmContext    = allBindingsAccessor().confirmContext || bindingContext,
          templateName      = allBindingsAccessor().confirmTemplate || 'cancel-confirmation';

      confirmContext = confirmContext.extend({ onConfirmCallback: onConfirmCallback });

      ko.bindingHandlers.dropdown.init(element, function() { return templateName; }, allBindingsAccessor, viewModel, confirmContext);
    }
  };

})(ko, $);