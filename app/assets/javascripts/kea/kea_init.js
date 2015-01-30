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
  }
};