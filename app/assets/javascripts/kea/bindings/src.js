(function(ko, $) {
  "use strict";

  ko.bindingHandlers.src = {
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var value = valueAccessor(),
          newValueAccessor;
      
      newValueAccessor = function newValueAccessor() {
        return {
          src: value
        };
      };
      
      ko.bindingHandlers.attr.update(element, newValueAccessor, allBindingsAccessor, viewModel, bindingContext);
    }
  };

})(ko, $);