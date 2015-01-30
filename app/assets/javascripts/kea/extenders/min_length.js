(function(ko, $) {
  "use strict";

  ko.extenders.minLength = function(target, options) {
      ko.utils.validatorBase(target);

      var defaults = {
        message: "",
        length: 0,
        allowBlank: false
      };

      options = $.extend({}, defaults, options);
   
      target.validate = function validate(newValue, newComparisonValue) {
        var validatableValue  = typeof newValue === 'undefined' ? target() : newValue;

        if (options.allowBlank && (!validatableValue || validatableValue === '')) {
          target.markValid();
          
          return !target.hasError();
        }

        if (typeof validatableValue !== 'undefined' && validatableValue.length >= options.length) {
          target.markValid();
        } else {
          target.markInvalid(options.message);
        }

        return !target.hasError();
      };
   
      target.subscribe(target.validate);
   
      //return the original observable
      return target;
  };

})(ko, $);