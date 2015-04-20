(function(ko, $) {
  "use strict";

  ko.components.register('komplete-search', {
      viewModel: function(params) {
        this.mandatory = typeof params.mandatory === 'undefined' ? false : params.mandatory;
        this.options   = params.options || {};
      },
      template:
        '<div data-bind="komplete: options" class="komplete">' +
          '<!-- ko template: { nodes: $componentTemplateNodes } --><!-- /ko -->' +
          '<!-- ko if: $component.mandatory -->' +
            '<input type="text" data-bind="value: searchTerm, valueUpdate: \'keyup\'" class="komplete-search-term">' +
          '<!-- /ko -->' +
          '<div data-bind="visible: showDropdown" class="komplete-dropdown">' +
            '<ul data-bind="foreach: searchResults">' +
              '<li data-bind="text: label, click: $parent.select.bind($parent, $data), css: { \'has-focus\': hasFocus }, clickBubble: false"></li>' +
            '</ul>' +
          '</div>' +
        '</div>'
  });

})(ko, $);