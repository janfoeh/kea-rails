(function(ko, $) {
  "use strict";

  ko.bindingHandlers.popover = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var options,
          childVmName,
          parentVm,
          childVmSetupContext,
          childVm,
          clickHandler;

      if (typeof ko.unwrap(valueAccessor()) === 'string') {
        childVmName         = ko.unwrap(valueAccessor());
        parentVm            = bindingContext.$parent;
        childVmSetupContext = bindingContext.$data;

      } else {
        options = ko.unwrap(valueAccessor());

        childVmName         = options.name;
        parentVm            = options.parentVm ? options.parentVm : bindingContext.$parent;
        childVmSetupContext = options.setupContext ? options.setupContext : bindingContext.$data;
      }

      childVm = parentVm.getVm(childVmName);

      if (typeof childVm.setup === 'function') {

        clickHandler = function clickHandler() {
          childVm.setup(childVmSetupContext);
        };

        ko.bindingHandlers.click.init(element, function() { return clickHandler; }, allBindingsAccessor, viewModel, bindingContext);
      }

      return ko.bindingHandlers.attache.init(element, function() { return childVm; }, allBindingsAccessor, viewModel, bindingContext);
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
      var options,
          childVmName,
          parentVm,
          childVm,
          submitComplete;

      if (typeof ko.unwrap(valueAccessor()) === 'string') {
        childVmName = ko.unwrap(valueAccessor());
        parentVm    = bindingContext.$parent;

      } else {
        options = ko.unwrap(valueAccessor());

        childVmName = options.name;
        parentVm    = options.parentVm ? options.parentVm : bindingContext.$parent;
      }

      childVm         = parentVm.getVm(childVmName);
      submitComplete  = ko.unwrap(childVm.submitComplete);

      if (submitComplete) {
        $(element).attache().hide();
      }
    }
  };

})(ko, $);