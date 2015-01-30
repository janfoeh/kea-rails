(function(ko, $) {
  "use strict";

  ko.bindingHandlers.waitForVm = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var vmName = ko.unwrap(valueAccessor()),
          subscription,
          childVm;

      childVm = ko.utils.arrayFirst(viewModel._childVms(), function(item) {
        return item._viewmodelName() === vmName;
      });

      // if the child viewmodel isn't available yet...
      if (!childVm) {

        // subscribe to the list of child viewmodels
        subscription = viewModel._childVms.subscribe(function() {
          childVm = ko.utils.arrayFirst(viewModel._childVms(), function(item) {
            return item._viewmodelName() === vmName;
          });

          // and if it has become available now, remove the subscription,
          // apply the bindings to our child elements and make ourselves visible
          if (childVm) {
            subscription.dispose();
            ko.applyBindingsToDescendants(bindingContext, element);
            ko.bindingHandlers.visible.update(element, function() { return childVm; }, allBindingsAccessor, viewModel, bindingContext);
          }
        });
      }

      // hide ourselves and our children if the viewmodel isn't 
      // immediately available on init().
      ko.bindingHandlers.visible.update(element, function() { return childVm; }, allBindingsAccessor, viewModel, bindingContext);

      // prevent our descendant elements from being bound if the
      // viewmodel isn't immediately available on init(). We will
      // take care of that later ourselves through ko.applyBindingsToDescendants
      return {controlsDescendantBindings: !childVm};
    }
  };

})(ko, $);