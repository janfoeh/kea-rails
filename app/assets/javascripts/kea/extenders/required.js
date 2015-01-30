(function(ko, $) {
  "use strict";

  ko.extenders.required = function(target, options) {
      ko.utils.validatorBase(target);

      var defaults = {
        message: "",
        validate_if: null
      };

      options = $.extend({}, defaults, options);
      
      target.isRequired = true;
   
      target.validate = function validate(newValue) {
        if (typeof options.validate_if === 'function' && !options.validate_if()) {
          target.markValid();
          return true;
        }
        
        var validatableValue = typeof newValue === 'undefined' ? target() : newValue;

        if (validatableValue) {
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