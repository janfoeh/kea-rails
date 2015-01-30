(function(ko, $) {
  "use strict";

  ko.bindingHandlers.submitButton = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var $element    = $(element),
          boundModel  = ko.unwrap(valueAccessor()),
          onSubmitSuccess = allBindingsAccessor().onSubmitSuccess || null;

      $element.activityButton();

      if (onSubmitSuccess) {
        boundModel.submitComplete.subscribe(function(submitState) {
          if (submitState) {
            onSubmitSuccess($element, boundModel);
          }
        });
      }

      ko.bindingHandlers.click.init(element, function() { return boundModel.submit; }, allBindingsAccessor, viewModel, bindingContext);
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var $element      = $(element),
          boundModel    = ko.unwrap(valueAccessor()),
          isActive      = ko.unwrap(boundModel.submitInProgress),
          isSubmittable = ko.unwrap(boundModel.isSubmittable);

      isActive ? $element.activityButton().on() : $element.activityButton().off();
      isSubmittable ? $element.removeClass('disabled') : $element.addClass('disabled');
    }
  };

})(ko, $);