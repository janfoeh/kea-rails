(function(ko, $) {
  "use strict";

  ko.utils.validatorBase = function(target) {
    if (typeof target.isValidatable === 'undefined') {
      target.isValidatable = true;
    }

    if (typeof target.hasError === 'undefined') {
      target.hasError = ko.observable();
    }

    if (typeof target.isUnvalidated === 'undefined') {
      target.isUnvalidated = ko.observable(true);
    }

    if (typeof target.validationInProgress === 'undefined') {
      target.validationInProgress = ko.observable(false);
    }

    if (typeof target.onNextValidationChange === 'undefined') {
      target.onNextValidationChange = null;
    }

    if (typeof target.validationMessage === 'undefined') {
      target.validationMessage = ko.observable();
    }
    
    if (typeof target.forceValidate === 'undefined') {
      target.forceValidate = function forceValidate() {
        var args = Array.prototype.slice.call(arguments);
        
        target.validate.apply(target, args);
      };
    }

    if (typeof target.markValid === 'undefined') {
      target.markValid = function markValid() {
        var hadError        = target.hasError(),
            wasUnvalidated  = target.isUnvalidated();

        target.hasError(false);

        if (target.isUnvalidated()) {
          target.isUnvalidated(false);
        }

        if ((hadError || wasUnvalidated) && target.onNextValidationChange) {
          target.onNextValidationChange(true);
          target.onNextValidationChange = null;
        }
      };
    }

    if (typeof target.markInvalid === 'undefined') {
      target.markInvalid = function markInvalid(message) {
        var hadError        = target.hasError(),
            wasUnvalidated  = target.isUnvalidated();

        target.hasError(true);
        target.validationMessage(message);

        if (target.isUnvalidated()) {
          target.isUnvalidated(false);
        }

        if ((!hadError || wasUnvalidated) && target.onNextValidationChange) {
          target.onNextValidationChange(false);
          target.onNextValidationChange = null;
        }
      };
    }
  };

})(ko, $);