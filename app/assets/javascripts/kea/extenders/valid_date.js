(function(ko, $, moment) {
  "use strict";

  ko.extenders.validDate = function(target, options) {
      ko.utils.validatorBase(target);

      var defaults = {
        message: "",
        allowBlank: true,
        format: 'YYYY-MM-DD',
        min: null,
        max: null
      };

      options = $.extend({}, defaults, options);
   
      target.validate = function validate(newValue) {
        var validatableValue  = typeof newValue === 'undefined' ? target() : newValue,
            m                 = moment(validatableValue, options.format);

        if (options.allowBlank && target.isBlank(validatableValue)) {
          target.markValid();
          return;
        }

        if ( m === null || !m.isValid()) {
          target.markInvalid(options.message);
          return false;
        }
        
        if (options.min && m.isBefore(options.min)) {
          target.markInvalid(options.message);
          return false;
        }
        
        if (options.max && m.isAfter(options.max)) {
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