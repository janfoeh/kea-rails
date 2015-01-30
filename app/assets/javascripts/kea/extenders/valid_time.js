(function(ko, $) {
  "use strict";

  ko.extenders.validTime = function(target, options) {
      ko.utils.validatorBase(target);

      var defaults = {
        message: ""
      };

      options = $.extend({}, defaults, options);
   
      target.validate = function validate(newValue) {
        var validatableValue = typeof newValue === 'undefined' ? target() : newValue,
            hour,
            minute;

        if (validatableValue.indexOf(':') === -1) {
          target.markInvalid(options.message);
          return false;
        }

        hour    = parseInt(validatableValue.split(':')[0], 10);
        minute  = parseInt(validatableValue.split(':')[1], 10);

        if ( (hour < 0 || hour > 23) || (minute < 0 || minute > 59) ) {
          target.markInvalid(options.message);
          return false;
        }

        target.markValid();
        return true;
      };
   
      target.subscribe(target.validate);
   
      //return the original observable
      return target;
  };

})(ko, $);