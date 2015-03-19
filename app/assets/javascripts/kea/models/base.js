(function(app, kea, ko) {
  "use strict";

  var Base,
      Serializable,
      Validatable;

  Base = function Base() {
    
    this.id            = null;
    this.resource_path = null;
    
    this.persisted = ko.observable(false);
    
    this._attributeNames                    = [];
    this._deserializableAttributes          = [];
    this._serializableAttributes            = [];
    this._deserializableAssociations        = {};
    this._serializableAssociations          = {};
    this._deserializableHasManyAssociations = {};
    this._serializableHasManyAssociations   = {};
    
    this.deserializationOptions = { attributes: {} };
    this.serializationOptions   = { attributes: {} };
  };

  Base.prototype._modelName = function _modelName() {
    console.error("Model does not implement _modelName");
  };
  
  Base.prototype.addAttribute = function addAttribute(name, options) {
    options             = options || {};
    options.array       = typeof options.array !== 'undefined' ? options.array : false;
    options.deserialize = typeof options.deserialize !== 'undefined' ? options.deserialize : true;
    options.serialize   = typeof options.serialize !== 'undefined' ? options.serialize : true;
    
    if (options.array) {
      this[name] = ko.observableArray([]);
    } else {
      this[name] = ko.observable(options.value);
    }
    
    if (options.deserialize) {
      this._deserializableAttributes.push(name);
      
      if (typeof options !== 'boolean') {
        this.deserializationOptions.attributes[name] = options.deserialize;
      }
    }
    
    if (options.serialize) {
      this._serializableAttributes.push(name);
      
      if (typeof options !== 'boolean') {
        this.serializationOptions.attributes[name] = options.serialize;
      }
    }
  };
  
  Base.prototype.unserializableAttributes = function unserializableAttributes(attributeNames) {
    attributeNames.forEach(function(name) {
      this.addAttribute(name, {serialize: false});
    }, this);
  };
  
  Base.prototype.serializableAttributes = function unserializableAttributes(attributeNames) {
    attributeNames.forEach(function(name) {
      this.addAttribute(name);
    }, this);
  };
  
  Base.prototype.addAssociation = function addAssociation(modelName, attributeName, type, options) {
    var deserializationKey,
        serializationKey;
        
    options             = options || {};
    options.deserialize = typeof options.deserialize !== 'undefined' ? options.deserialize : true;
    options.serialize   = typeof options.serialize !== 'undefined' ? options.serialize : true;
    
    if (type === 'hasOne') {
      this[attributeName] = ko.observable();
      deserializationKey  = '_deserializableAssociations';
      serializationKey    = '_serializableAssociations';
      
    } else if (type === 'hasMany') {
      this[attributeName] = ko.observableArray([]);
      deserializationKey  = '_deserializableHasManyAssociations';
      serializationKey    = '_serializableHasManyAssociations';
      
    } else {
      console.error('unsupported association type %s', type);
      return;
    }
    
    if (options.deserialize) {
      this[deserializationKey][attributeName] = modelName;
      
      if (typeof options !== 'boolean') {
        this.deserializationOptions.attributes[attributeName] = options.deserialize;
      }
    }
    
    if (options.serialize) {
      this[serializationKey][attributeName] = modelName;
      
      if (typeof options !== 'boolean') {
        this.serializationOptions.attributes[attributeName] = options.serialize;
      }
    }
  };
  
  Base.prototype.hasOne = function hasOne(modelName, attributeName, options) {
    if (typeof attributeName === 'undefined') {
      attributeName = modelName.toLowerCase();
    }
    
    this.addAssociation(modelName, attributeName, 'hasOne', options);
  };
  
  Base.prototype.hasMany = function hasMany(modelName, attributeName, options) {
    this.addAssociation(modelName, attributeName, 'hasMany', options);
  };
  
  Base.prototype.forEachAssocation = function forEachAssocation(type, callback) {
    var key = '_' + type + 'Associations';
    
    for (var attributeName in this[key]) {
      if ( this[key].hasOwnProperty(attributeName) ) {
        callback.call(this, attributeName, this[key][attributeName]);
      }
    }
  };

  Base.prototype.service = function service() {
    if (DEBUG) {
      console.assert(app.services[ this._modelName() ], this._modelName() + " service does not exist");
    }

    return app.services[ this._modelName() ];
  };

  Base.prototype.update = function update(params) {
    var that = this,
        deferred;

    deferred = this.service()
      .update(that, params)
      .done(function(data) {
        that.deserialize(data);
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
  
  Base.prototype.deserialize = function deserialize(data) {
    this.persisted(true);
    
    this.id            = data.id;
    this.resource_path = data.resource_path;
    
    this._deserializableAttributes.forEach(function(name) {
      var newValue = data[name];
      
      if (this.deserializationOptions.attributes[name] &&
          this.deserializationOptions.attributes[name].map === true) {
        
        var currentValue = this[name]();

        if (typeof currentValue === 'object') {
          ko.mapping.fromJS(newValue, {}, currentValue);
        } else {
          this[name]( ko.mapping.fromJS(newValue) );
        }
        
      } else {
        this[name](newValue);
      }
    }, this);
    
    this.forEachAssocation('deserializable', function(attributeName, modelName) {
      if ( data[attributeName] ) {
        this[attributeName]( new app.models[modelName](data[attributeName]) );
      }
    });
    
    this.forEachAssocation('deserializableHasMany', function(attributeName, modelName) {
      if ( data[attributeName] ) {
        this[attributeName].removeAll();
        
        data[attributeName].forEach(function(associationData) {
          this[attributeName].push( new app.models[modelName](associationData) );
        }, this);
      }
    });
    
    if (typeof this.fromJS === 'function') {
      this.fromJS(data);
    }
  };
  
  Base.prototype.serialize = function serialize(options) {
    var that = this,
        result = {},
        defaultOptions,
        attributeList,
        attributeOptions,
        isBlank,
        shouldIncludeAttribute;
    
    defaultOptions = {
      includeId: false,
      attributes: {}
    };
    
    options = $.extend({}, defaultOptions, this.serializationOptions, options);
    
    attributeOptions = function attributeOptions(attributeName) {
      return options.attributes[attributeName] || {};
    };
    
    isBlank = function isBlank(value) {
      return typeof value === 'undefined' || value === null || value === '' || (Array.isArray(value) && value.length === 0 );
    };
    
    shouldIncludeAttribute = function shouldIncludeAttribute(name, value) {
      var skipBlank = typeof attributeOptions(name).skipBlank !== 'undefined' ? attributeOptions(name).skipBlank : options.skipBlank;
      
      if (skipBlank && isBlank(value)) {
        return false;
      } else {
        return true;
      }
    };
    
    if (options.includeId) {
      result.id = this.id;
    }
    
    if (this._destroy) {
      result._destroy = true;
    }
    
    this._serializableAttributes.forEach(function(name) {
      var value = this[name]();
      
      if (shouldIncludeAttribute(name, value)) {
        
        if (attributeOptions(name).map === true) {
          result[name] = ko.mapping.toJS(value);
        } else {
          result[name] = value;
        }
        
      }
    }, this);
    
    this.forEachAssocation('serializable', function(attributeName, modelName) {
      var value,
          key;
      
      if (attributeOptions(attributeName).idOnly) {
        value = this[attributeName]() ? this[attributeName]().id : null;
        key   = attributeName + '_id';
      } else {
        value = this[attributeName]() ? this[attributeName]().serialize() : null;
        key   = attributeName;
      }

      if (shouldIncludeAttribute(attributeName, value)) {
        result[key] = value;
      }
    });
    
    this.forEachAssocation('serializableHasMany', function(attributeName, modelName) {
      var value = this[attributeName]().map(function(association) { return association.serialize(); } );
      
      if (shouldIncludeAttribute(attributeName, value)) {
        result[attributeName + '_attributes'] = value;
      }
    });
    
    if (typeof this.toJS === 'function') {
      result = this.toJS(result);
    }
    
    return result;
  };
  
  kea.models.Base = Base;

  Validatable = function Validatable() {
    var that = this;

    this.isValidatable = ko.observable(false);

    this.makeValidatable = function makeValidatable(options) {
      if (DEBUG) {
        console.assert(this.attachValidators, "object does not implement attachValidators");
      }

      this.attachValidators(options);
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
          callback.call(that, that[field], field);
        }
      });
    };

    this.forEachValidatableAssociation = function forEachValidatableAssociation(callback) {
      var association_list;

      ko.utils.arrayForEach(this.validatableAssociations(), function(association_name) {
        var association = that[association_name]();
        
        if (association.isValidatable && association.isValidatable()) {
          callback.call(that, association, association_name);
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

      that.forEachValidatableField(function(observable, fieldName) {
        if (observable.hasError()) {
          messages.push(fieldName + ': ' + observable.validationMessage());
        }
      }, this);

      that.forEachValidatableAssociation(function(association, name) {
        if (association.hasErrors()) {
          messages = name + ': ' + messages.concat(association.validationMessages());
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