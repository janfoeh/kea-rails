(function(ko, $) {
  "use strict";

  ko.bindingHandlers.childVm = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var vmName        = ko.unwrap(valueAccessor()),
          parentVm      = allBindingsAccessor().parentVm ? ko.unwrap(allBindingsAccessor().parentVm) : viewModel,
          initVm        = allBindingsAccessor().initVm ? ko.unwrap(allBindingsAccessor().initVm) : false,
          setupContext  = allBindingsAccessor().setupContext ? ko.unwrap(allBindingsAccessor().setupContext) : null,
          childVm;

      if (initVm) {
        childVm = parentVm.addChildVm(vmName);
      } else {
        childVm = ko.utils.arrayFirst(parentVm._childVms(), function(item) {
          return item._viewmodelName() === vmName;
        });
      }

      if (setupContext && typeof childVm.setup === 'function') {
        childVm.setup(setupContext);
      }

      // 'with' returns {controlsDescendants: true}, so we have to pass it up - otherwise,
      // the descendant bindings will be bound twice ("You cannot apply bindings multiple times to the same element")
      return ko.bindingHandlers.with.init(element, function() { return childVm; }, allBindingsAccessor, viewModel, bindingContext);
    }
  };
  
  ko.virtualElements.allowedBindings.childVm = true;

})(ko, $);