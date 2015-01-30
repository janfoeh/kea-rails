(function(ko, $) {
  "use strict";

  ko.bindingHandlers.validationState = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var $element = $(element),
          tooltipPosition = allBindingsAccessor().tooltipPosition || 'center top';

      $element.attache({popoverClass: 'formerror', position: tooltipPosition});

      ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
        $element.attache().destroy();
      });
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var $element          = $(element),
          $parentLabel      = $element.parent('label'),
          hasParentLabel    = $parentLabel.length > 0,
          $cssClassLocation = hasParentLabel ? $parentLabel.find('span.custom') : $element,
          $errorMessage     = hasParentLabel ? $parentLabel.find('span.error.message') : $element.next('span.error.message'),
          observable        = valueAccessor(),
          hasError          = ko.unwrap(observable.hasError ? observable.hasError : observable.hasErrors),
          messageText       = ko.unwrap(observable.validationMessage ? observable.validationMessage : observable.validationMessages);

      if (typeof hasError === 'undefined' || !hasError) {
        $cssClassLocation.removeClass('error');
        $element.attache().hide();

      } else {
        $cssClassLocation.addClass('error');

        $element.attache().setContent(messageText);
        $element.attache().show();
      }
    }
  };

})(ko, $);