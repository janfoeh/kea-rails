(function(ko, $, moment) {
  "use strict";

  ko.extenders.validDate = function(target, options) {
      ko.utils.validatorBase(target);

      var defaults = {
        message: ""
      };

      options = $.extend({}, defaults, options);
   
      target.validate = function validate(newValue) {
        var validatableValue  = typeof newValue === 'undefined' ? target() : newValue,
            m                 = moment(validatableValue, ["DD MM", "DD MM YY", "DD MM YYYY"]);

        if ( m === null || !m.isValid() || m.isBefore(moment().startOf('day')) ) {
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

})(ko, $, moment);