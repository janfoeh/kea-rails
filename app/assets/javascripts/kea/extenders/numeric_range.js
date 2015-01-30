(function(ko, $) {
  "use strict";

  ko.extenders.numericRange = function(target, options) {
      ko.utils.validatorBase(target);

      var defaults = {
        message: "",
        allowBlank: true,
        requiredMessage: "",
        if: null,
        dependencies: []
      };

      options = $.extend({}, defaults, options);
   
      target.validate = function validate(newValue) {
        var validatableValue = typeof newValue === 'undefined' ? target() : newValue;

        validatableValue = parseInt(validatableValue, 10);

        if (typeof options.if === 'function' && options.if() === false) {
          target.markValid();
          return true;
        }

        if (!validatableValue && !options.allowBlank) {
          target.markInvalid(options.requiredMessage);
          return false;
        }

        if (typeof options.min !== 'undefined' && validatableValue < options.min) {
          target.markInvalid(options.message);
          return false;
        }

        if (typeof options.max !== 'undefined' && validatableValue > options.max) {
          target.markInvalid(options.message);
          return false;
        }

        target.markValid();
        return true;
      };
   
      target.subscribe(target.validate);
      
      if (ko.isObservable(options.if)) {
        options.dependencies.push(options.if);
      }
      
      ko.utils.arrayForEach(options.dependencies, function(dependency) {
        dependency.subscribe(function(newValue) {
          if (!target.isUnvalidated()) {
            target.validate();
          }
        });
      });
   
      //return the original observable
      return target;
  };

})(ko, $);