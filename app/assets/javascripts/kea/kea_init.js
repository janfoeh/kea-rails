window.app            = window.app || {};
window.app.models     = window.app.models || {};
window.app.services   = window.app.services || {};
window.app.viewmodels = window.app.viewmodels || {};

window.app.sherlock = {
  providers: []
};

window.app.initializers = window.app.initializers || [];
window.app.page         = window.app.page || {};
window.app.paths        = window.app.paths || {};

window.app.paths.assets = '/assets';
window.app.paths.tags   = '/rubriken';
window.app.paths.users   = '/users';
window.app.paths.stories = '/stories';

window.app.u = {
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

moment.lang('de');

Veil.globalOptions.backdropMarkup = null;