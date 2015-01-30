(function(app, kea, ko) {
  "use strict";

  var Base,
      Validatable;

  Base = function Base() {

  };

  Base.prototype._modelName = function _modelName() {
    console.error("Model does not implement _modelName");
  };

  Base.prototype.service = function service() {
    if (DEBUG) {
      console.assert(app.services[ this._modelName() ], this._modelName() + " service does not exist");
    }

    return app.services[ this._modelName() ];
  };

  Base.prototype.fromJSON = function fromJSON(json) {
    console.error("object does not implement fromJSON: %O", this);
  };

  Base.prototype.serialize = function serialize() {
    console.error("object does not implement serialize: %O", this);
  };

  Base.prototype.update = function update(params) {
    var that = this,
        deferred;

    deferred = this.service()
      .update(that, params)
      .done(function(data) {
        that.fromJSON(data);
      });

    return deferred;
  };

  Base.prototype.destroy = function destroy() {
    return $.ajax({
      type:     'DELETE',
      url:      this.resource_path,
      dataType: 'JSON'

    }).fail(function(jqXHR, textStatus) {
      window.kea.notify(textStatus, 'error');

    });
  };

  kea.models.Base = Base;

  Validatable = function Validatable() {
    var that = this;

    this.isValidatable = ko.observable(false);

    this.makeValidatable = function makeValidatable() {
      if (DEBUG) {
        console.assert(this.attachValidators, "object does not implement attachValidators");
      }

      this.attachValidators();
      this.isValidatable(true);
    };

    this.validatableFields = function validatableFields() {
      return [];
    };

    this.validatableAssociations = function validatableAssociations() {
      return [];
    };

    this.validatableAssociationLists = function validatableAssociationLists() {
      return [];
    };

    this.forEachValidatableField = function forEachValidatableField(callback) {
      ko.utils.arrayForEach(this.validatableFields(), function(field) {
        if (that[field].isValidatable) {
          callback.call(that, that[field]);
        }
      });
    };

    this.forEachValidatableAssociation = function forEachValidatableAssociation(callback) {
      var association_list;

      ko.utils.arrayForEach(this.validatableAssociations(), function(association_name) {
        var association = that[association_name]();
        
        if (association.isValidatable && association.isValidatable()) {
          callback.call(that, association);
        }
      });

      ko.utils.arrayForEach(this.validatableAssociationLists(), function(association_list_name) {
        association_list = that[association_list_name];

        ko.utils.arrayForEach(association_list(), function(association) {
          if (association.isValidatable && association.isValidatable()) {
            callback.call(that, association);
          }
        });
      });
    };

    this.hasErrors = ko.computed(function hasErrors() {
      var result = false;

      that.forEachValidatableField(function(observable) {
        if (observable.hasError()) {
          result = true;
        }
      }, this);

      if (result) {
        return true;
      }

      that.forEachValidatableAssociation(function(association) {
        if (association.hasErrors()) {
          result = true;
        }
      });

      return result;
    }, this, {deferEvaluation: true});
    
    this.validationMessages = ko.computed(function validationMessages() {
      var messages = [];

      that.forEachValidatableField(function(observable) {
        if (observable.hasError()) {
          messages.push(observable.validationMessage());
        }
      }, this);

      that.forEachValidatableAssociation(function(association) {
        if (association.hasErrors()) {
          messages = messages.concat(association.validationMessages());
        }
      });

      return messages;
    }, this, {deferEvaluation: true});

    this.isFullyValidated = ko.computed(function isFullyValidated() {
      var result = true;

      that.forEachValidatableField(function(observable) {
        if (observable.isUnvalidated() || observable.validationInProgress()) {
          result = false;
        }
      });

      if (!result) {
        return false;
      }

      that.forEachValidatableAssociation(function(association) {
        if (!association.isFullyValidated() || association.hasValidationsInProgress()) {
          result = false;
        }
      });

      return result;
    }, this, {deferEvaluation: true});

    this.hasValidationsInProgress = ko.computed(function hasValidationsInProgress() {
      var result = false;

      that.forEachValidatableField(function(observable) {
        if (observable.validationInProgress()) {
          result = true;
        }
      });

      if (result) {
        return true;
      }

      that.forEachValidatableAssociation(function(association) {
        if (association.hasValidationsInProgress()) {
          result = true;
        }
      });

      return result;
    }, this, {deferEvaluation: true});

    this.isValid = ko.computed(function isValid() {
      return !this.hasErrors() && this.isFullyValidated();
    }, this, {deferEvaluation: true});

    this.validate = function validate() {
      that.forEachValidatableField(function(observable) {
        observable.validate();
      });

      that.forEachValidatableAssociation(function(association) {
        association.validate();
      });
    };
  };

  kea.models.Validatable = Validatable;

})(window.app, window.kea, ko);