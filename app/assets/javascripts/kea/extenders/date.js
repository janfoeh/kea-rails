(function(ko, $, moment) {
  "use strict";

  ko.extenders.date = function(target, options) {

      options = options || {
        internal: 'YYYY-MM-DD',
        external: 'YYYY-MM-DD'
      };
      
      options.external = options.external || options.internal;

      target.date = ko.computed({
        read: function() {
          var m = moment(target(), options.internal);
          
          return m && m.isValid() ? m.format(options.external) : null;
        },
        write: function(newValue) {
          var m         = moment(newValue, options.external),
              formatted = m && m.isValid() ? m.format(options.internal) : newValue;
              
          target(formatted);
        }
      }, this);
   
      //return the original observable
      return target;
  };

})(ko, $, moment);