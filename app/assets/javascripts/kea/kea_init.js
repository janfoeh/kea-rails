window.kea            = window.kea || {};
window.kea.models     = window.kea.models || {};
window.kea.services   = window.kea.services || {};
window.kea.viewmodels = window.kea.viewmodels || {};

window.kea.sherlock = {
  providers: []
};

window.kea.u = {
  inherit: function inherit(Child, Parent) {
    "use strict";

    Child.super_ = Parent;
    Child.prototype = Object.create(Parent.prototype, {
      constructor: {
        value: Child,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  },
  
  camelizeString: function camelizeString(string) {
    "use strict";
    
    var string_parts = string.toLowerCase().split('_');
    
    for (var x = 0; x < string_parts.length; x++) {
        string_parts[x] = string_parts[x].charAt(0).toUpperCase() + string_parts[x].substring(1);
    }
    
    return string_parts.join('');
  },
  
  underscoreString: function underscoreString(string) {
    "use strict";
    
    var _regex_uppercase        = new RegExp('([A-Z])', 'g'),
        _regex_underbar_prefix  = new RegExp('^_');
          
    string = string.replace(_regex_uppercase, '_$1');
    string = string.replace(_regex_underbar_prefix, '');

    return string.toLowerCase();
  },
  
  dashString: function dashString(string) {
    "use strict";
    
    var _regex_uppercase    = new RegExp('([A-Z])', 'g'),
        _regex_dash_prefix  = new RegExp('^-');
          
    string = string.replace(_regex_uppercase, '-$1');
    string = string.replace(_regex_dash_prefix, '');

    return string.toLowerCase();
  }
};