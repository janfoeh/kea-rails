(function(ko, $) {
  "use strict";

  ko.extenders.externalValidator = function(target, options) {
      ko.utils.validatorBase(target);

      var defaults = {
        message: "",
        validator: function(v) {},
        dependencies: []
      };

      options = $.extend({}, defaults, options);
   
      target.validate = function validate(newValue) {
        var validatableValue  = typeof newValue === 'undefined' ? target() : newValue,
            validatorResponse = options.validator(validatableValue),
            validatorResponseHandler;

        validatorResponseHandler = function validatorResponseHandler(response) {
          var result, message;

          if (typeof response === 'boolean') {
            result  = response;
            message = options.message;

          } else {
            result  = response.result;
            message = response.message;
          }
          
          if (result) {
            target.markValid();
          } else {
            target.markInvalid(message);
          }
        };

        if (typeof validatorResponse === 'object' && typeof validatorResponse.done === 'function') {
          target.validationInProgress(true);
          validatorResponse.done(function(response) { validatorResponseHandler(response); target.validationInProgress(false); });
          return;

        } else {
          validatorResponseHandler(validatorResponse);
          return !target.hasError();
        }
      };
   
      //validate whenever the value changes
      target.subscribe(target.validate);
      
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