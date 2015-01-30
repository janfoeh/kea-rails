(function(ko, $) {
  "use strict";

  ko.bindingHandlers.activity = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var $element      = $(element),
          activityState = ko.unwrap(valueAccessor());

      $element.activityButton();
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var $element      = $(element),
          activityState = ko.unwrap(valueAccessor());
          
      if (activityState && !$element.activityButton().active()) {
        $element.activityButton().on();
        
      } else if (!activityState && $element.activityButton().active()) {
        $element.activityButton().off();
      }
    }
  };

})(ko, $);