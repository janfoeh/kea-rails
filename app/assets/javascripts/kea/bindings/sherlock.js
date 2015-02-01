(function(ko, $) {
  "use strict";

  ko.bindingHandlers.sherlock = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var $container  = $(element),
          options     = typeof ko.unwrap(valueAccessor()) === 'object' ? ko.unwrap(valueAccessor()) : {},
          $providerSearchField,
          sherlockVm;
      
      sherlockVm = new app.sherlock.SherlockVm();
      sherlockVm.setup(options);
      
      sherlockVm.params.subscribe(function(params) {
        bindingContext.$data.sherlockParams(params);
      });
      
      ko.renderTemplate('sherlock-container-template', sherlockVm, {}, element);
      
      $container.addClass('sherlock-search-bar');
      
      $providerSearchField = $container.find('.provider-search-field > input');
      
      $providerSearchField.on('focus', function() {
        sherlockVm.providerSearchActive(true);
      });
      
      $providerSearchField.on('blur', function() {
        // if we do not delay this, it will fire before the 'click'
        // event on dropdown list entries, clearing the list
        setTimeout(function() {
          sherlockVm.providerSearchActive(false);
        }, 200);
      });
      
      $container.on('click', function() {
        $providerSearchField.focus();
      });
      
      return { controlsDescendantBindings: true };
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

    }
  };

})(ko, $);