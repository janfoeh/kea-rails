(function(app, kea, ko) {
  "use strict";

  // Sub-viewmodel handling. Use with borrowed constructor pattern

  var Parent = function Parent() {
    var that = this;

    this._childVms = ko.observableArray();

    this.addChildVm = function addChildVm(vm) {
      var vmName = vm;

      if (DEBUG) {
        console.assert(app.viewmodels[vmName], vmName + " viewmodel could not be loaded into " + that._viewmodelName());
      }

      vm = new app.viewmodels[vmName]();

      if (typeof vm.initChildFromParent === 'function') {
        if (DEBUG) {
          console.group("%s: init sub-vm %s", that._viewmodelName(), vm._viewmodelName());
        }

        vm.initChildFromParent(that);

        if (DEBUG) { console.groupEnd(); }
      }

      that._childVms.push( vm );
      
      return vm;
    };

    this.getVm = function getVm(name) {
      return ko.utils.arrayFirst(that._childVms(), function(item) {
        return item._viewmodelName() === name;
      });
    };
  };

  kea.viewmodels.Parent = Parent;

  // Parent-viewmodel handling. Use with borrowed constructor pattern

  var Child = function Child() {
    var that = this;

    this._viewmodelName = function _viewmodelName() {
      throw "Viewmodel does not implement _viewmodelName";
    };

    this.parent = null;

    this.initChildFromParent = function initChildFromParent(parentVm) {
      that.parent = parentVm;

      if (typeof that.init === 'function') {
        that.init();
      }
    };
  };

  kea.viewmodels.Child = Child;

  // Object validation handling. Use with borrowed constructor pattern

  var Validatable = function Validatable() {
    var that = this;

    this.validatableName = ko.observable();

    this.validatable = ko.computed(function() {
      if (typeof that[ that.validatableName() ] !== 'undefined') {
        return that[ that.validatableName() ]();
      } else {
        return undefined;
      }
    });

    this.validatableFields = function validatableFields() {
      if (DEBUG) {
        console.assert(that.validatable().validatableFields, "%o does not implement validatableFields", that.validatable());
      }

      return that.validatable().validatableFields();
    };

    this.hasFieldsWithErrors = ko.computed(function() {
      var result = false;

      if (!that.validatable()) {
        return false;
      }

      ko.utils.arrayForEach(that.validatableFields(), function(field) {
        if ( that.validatable()[field].hasError() ) {
          result = true;
        }
      });

      return result;
    });

    this.hasUnvalidatedFields = ko.computed(function() {
      var result = false;

      if (!that.validatable()) {
        return false;
      }

      ko.utils.arrayForEach(that.validatableFields(), function(field) {
        if ( that.validatable()[field].isUnvalidated() ) {
          result = true;
        }
      });

      return result;
    });

    this.allFieldsValid = ko.computed(function() {
      return !that.hasFieldsWithErrors() && !that.hasUnvalidatedFields();
    });

    this.hasValidationsInProgress = ko.computed(function() {
      var result = false;

      if (!that.validatable()) {
        return false;
      }

      ko.utils.arrayForEach(that.validatableFields(), function(field) {
        if ( that.validatable()[field].validationInProgress() ) {
          result = true;
        }
      });

      return result;
    });

    this.validateAllFields = function validateAllFields() {
      ko.utils.arrayForEach(that.validatableFields(), function(field) {
        that.validatable()[field].forceValidate();
      });
    };
  };

  kea.viewmodels.Validatable = Validatable;

})(window.kea, window.kea, ko);