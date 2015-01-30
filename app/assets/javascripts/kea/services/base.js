(function(app, ko, URI) {
  "use strict";

  var _regex_uppercase        = new RegExp('([A-Z])', 'g'),
      _regex_underbar_prefix  = new RegExp('^_'),
      _lookupCache,
      _request,
      _defaultFailureHandler,
      _modelnameToParameter,
      _resourcePathForAction,
      failure422Handler,
      failure423Handler,
      getCollection,
      get,
      refresh,
      create,
      update,
      destroy;

  _lookupCache = function _lookupCache(path) {
    var cachedResult = app.cache[path];

    if (DEBUG) { console.debug("looking up cache for %s: %o", path, cachedResult); }

    return typeof cachedResult !== 'undefined' ? $.when(cachedResult) : undefined;
  };

  _request = function _request(type, path, params) {
    return $.ajax({
      type:     type,
      url:      path,
      data:     params,
      dataType: 'JSON'
    });
  };

  _defaultFailureHandler = function _defaultFailureHandler(jqXHR, textStatus) {
    if (DEBUG) {
      console.error("%s %s failed: %s", this.type, this.url, textStatus, jqXHR);
    }

    if (jqXHR.status === 0 && jqXHR.statusText === 'timeout') {
      window.app.notify("Server antwortet nicht <p><small>Der Server hat nicht rechtzeitig geantwortet. Bitte versuchen Sie es erneut!</small></p>", 'error');

    } else if (jqXHR.status === 500 || jqXHR.status === 400 || jqXHR.status === 404) {
      window.app.notify("Entschuldigung! Der Server hat Schluckauf. <p><small><pre>" + jqXHR.responseText + "</pre></small></p>", 'error');

    } else if (jqXHR.status === 403) {
      window.app.notify("Das geht nun wirklich nicht! <p><small>Diese Aktion ist nicht erlaubt</small></p>", 'error');
      
    }

  };

  failure422Handler = function failure422Handler(jqXHR, textStatus) {
    if (jqXHR.status === 422) {
      window.app.notify(jqXHR.responseText, 'error');
    }
  };
  
  failure423Handler = function failure423Handler(jqXHR, textStatus) {
    if (jqXHR.status === 423) {
      window.app.notify(jqXHR.responseText, 'error');
    }
  };

  // taken from https://code.google.com/p/inflection-js/source/browse/trunk/inflection.js
  _modelnameToParameter = function _modelnameToParameter(name) {
    name = name.replace(_regex_uppercase, '_$1');
    name = name.replace(_regex_underbar_prefix, '');

    return name.toLowerCase();
  };
  
  _resourcePathForAction = function _resourcePathForAction(action, modelObject) {
    var pathMethod = action + 'Path';
    
    if (typeof modelObject[pathMethod] === 'function') {
      return modelObject[action + 'Path']();
      
    } else if (modelObject.service() && typeof modelObject.service()[pathMethod] === 'function') {
      return modelObject.service()[pathMethod]();
      
    } else {
      return modelObject.resource_path;
    }
  };

  get = function get(modelName, path, params, cache_key) {
    var responseProcessor,
        deferred,
        cachedResult;

    params = params || {};

    if (cache_key === true) {
      cache_key = new URI(path).query(params).toString();
    }

    responseProcessor = function responseProcessor(data) {
      if (DEBUG) { console.debug("received resource %s: %o", modelName, data); }

      if ( $.isArray(data) ) {
        return ko.utils.arrayMap(data, function(json) {
          return new app.models[modelName](json);
        });

      } else {
        return new app.models[modelName](data);
      }
    };

    if (cache_key) {
      cachedResult = _lookupCache(cache_key);
    }

    return (cachedResult || _request('GET', path, params))
      .then(responseProcessor)
      .fail(_defaultFailureHandler);
  };
  
  refresh = function refresh(modelName, modelObject, params, path) {
    var responseProcessor,
        deferred;

    params = params || {};

    responseProcessor = function responseProcessor(data) {
      if (DEBUG) { console.debug("received resource %s for refresh: %o", modelName, data); }

      if ( $.isArray(data) ) {
        if (DEBUG) { console.error("received multiple resources when trying to refresh %s : %o", modelName, data); }

      } else {
        
        if (typeof modelObject.refreshFromJSON === 'function') {
          modelObject.refresh(data);
          
        } else {
          modelObject.fromJSON(data);
        }
        
        return modelObject;
      }
    };

    return _request('GET', path, params)
      .then(responseProcessor)
      .fail(_defaultFailureHandler);
  };

  create = function create(modelName, modelObject, path) {
    var params = {};

    if (!path) {
      path = _resourcePathForAction('create', modelObject);
    }

    params[ _modelnameToParameter(modelName) ] = modelObject.serialize();

    return $.ajax({
      type:     'POST',
      url:      path,
      data:     params,
      dataType: 'JSON'

    }).then(function(data) {
      if (DEBUG) { console.debug("POST %s: %o", path, data); }
      return new app.models[modelName](data);

    }).fail(_defaultFailureHandler);
  };

  update = function update(modelName, modelObject, attributeHash, path) {
    var params  = {};

    if (!path) {
      path = _resourcePathForAction('update', modelObject);
    }

    if (attributeHash) {
      params[ _modelnameToParameter(modelName) ] = attributeHash;
    } else {
      params[ _modelnameToParameter(modelName) ] = modelObject.serialize();
    }

    return $.ajax({
      type:     'PUT',
      url:      path,
      data:     params,
      dataType: 'JSON'

    }).then(function(data) {
      if (DEBUG) { console.debug("PUT %s: %o", path, data); }
      return data;

    }).fail(_defaultFailureHandler);
  };

  destroy = function destroy(modelName, modelObject, path) {
    
    if (!path) {
      path = _resourcePathForAction('destroy', modelObject);
    }

    return $.ajax({
      type:     'DELETE',
      url:      path,
      dataType: 'JSON'

    }).fail(_defaultFailureHandler);
  };

  app.services.Base = {
    getCollection: getCollection,
    get: get,
    refresh: refresh,
    create: create,
    update: update,
    destroy: destroy,
    failure422Handler: failure422Handler,
    failure423Handler: failure423Handler,
    _request: _request,
    _defaultFailureHandler: _defaultFailureHandler
  };

})(window.app, ko, URI);