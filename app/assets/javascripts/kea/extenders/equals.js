(function(ko, $) {
  "use strict";

  ko.extenders.equals = function(target, options) {
      ko.utils.validatorBase(target);

      var defaults = {
        message: "",
        to: null
      };

      options = $.extend({}, defaults, options);

      if (!options.to) {
        if (DEBUG) { console.error("equality validator is missing its comparison target"); }
      }
      
      target.shouldValidate = function shouldValidate(comparisonValueHasCHanged) {
        
        // don't validate if the comparison value
        // a) is invalid or unvalidated
        // b) was changed, but this value has not been validated before
        if (ko.isObservable(options.to)) {
          if (  ( options.to.isUnvalidated() || options.to.hasError() ) ||
                ( comparisonValueHasCHanged && target.isUnvalidated() ) ) {

            return false;
          }
        }
        
        return true;
      };
      
      target.performValidation = function performValidation(validatableValue, comparisonValue) {
        if (options.allowBlank && (!validatableValue || validatableValue === '')) {
          target.markValid();
          
          return !target.hasError();
        }

        if (validatableValue === comparisonValue) {
          target.markValid();
        } else {
          target.markInvalid(options.message);
        }

        return !target.hasError();
      };
   
      target.validate = function validate(newValue, newComparisonValue, comparisonValueHasCHanged) {
        var validatableValue  = typeof newValue === 'undefined' ? target() : newValue,
            comparisonValue   = typeof newComparisonValue === 'undefined' ? ko.unwrap(options.to) : newComparisonValue;

        if (!target.shouldValidate(comparisonValueHasCHanged)) {
          return;
        }
        
        return target.performValidation(validatableValue, comparisonValue);
      };
      
      target.forceValidate = function forceValidate(newValue, newComparisonValue, comparisonValueHasCHanged) {
        var validatableValue  = typeof newValue === 'undefined' ? target() : newValue,
            comparisonValue   = typeof newComparisonValue === 'undefined' ? ko.unwrap(options.to) : newComparisonValue;
        
        return target.performValidation(validatableValue, comparisonValue);
      };
   
      target.subscribe(target.validate);

      // trigger re-validation if the comparison value changes, too.
      // Only do this if this value has been validated before, or we risk throwing
      // an error before the user had time to fill out this field
      if (ko.isObservable(options.to)) {
        options.to.subscribe(function() {
          if (typeof target !== 'undefined') {
            target.validate(undefined, undefined, true);
          }
        });
      }
   
      //return the original observable
      return target;
  };

})(ko, $);