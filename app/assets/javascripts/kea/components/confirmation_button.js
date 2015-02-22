(function(ko, $) {
  "use strict";

  ko.components.register('confirmation-button', {
      viewModel: function(params) {
          this.text = ko.observable(params.initialText || '');
          this.css  = params.css || '';
      },
      template: '<!-- ko template: { nodes: $componentTemplateNodes } --><!-- /ko -->'
  });

})(ko, $);

(function(ko, $) {
  "use strict";

  ko.components.register('confirmation-button', {
      viewModel: {
        createViewModel: function createViewModel(params, componentInfo) {
          var ConfirmationButtonVm;
          
          ConfirmationButtonVm = function ConfirmationButtonVm(params) {
            
          };
          
          return new ConfirmationButtonVm(params);
        }
      },
      template: 'x'
  });

})(ko, $);