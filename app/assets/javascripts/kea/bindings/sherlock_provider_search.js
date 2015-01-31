(function(ko, $) {
  "use strict";

  ko.bindingHandlers.sherlockProviderSearch = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var $container            = $(element).find('.provider-search-dropdown'),
          $providerSearchField  = $(element).find('> input[type=text]'),
          sherlockVm            = bindingContext.$data,
          listener              = new window.keypress.Listener($providerSearchField.get(0)),
          keyCombos;
      
      listener.register_combo({
        keys: "down",
        on_keydown: function() { sherlockVm.focusNextFragment(); }
      });
      
      listener.register_combo({
        keys: "up",
        on_keydown: function() { sherlockVm.focusPreviousFragment(); }
      });
      
      listener.register_combo({
        keys: "enter",
        on_keydown: function() { $providerSearchField.get(0).blur(); sherlockVm.selectFocusedFragment(); }
      });
      
      listener.register_combo({
        keys: "backspace",
        on_keydown: function() {
          if (sherlockVm.providerSearchTerm().length === 0) {
            sherlockVm.removeLastActiveFragment();
          }
          
          return true;
        }
      });
      
      ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
        listener.destroy();
      });
      
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var $container  = $(element).find('.provider-search-dropdown'),
          sherlockVm  = bindingContext.$data,
          providerSearchActive    = sherlockVm.providerSearchActive(),
          fragmentsForSearchTerm = sherlockVm.fragmentsForSearchTerm();
          
      if (providerSearchActive && (fragmentsForSearchTerm.length > 0 || sherlockVm.liveSearchProviders().length > 0)) {
        $container.addClass('active');
      } else {
        $container.removeClass('active');
      }
    }
  };

})(ko, $);