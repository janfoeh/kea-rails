(function(app, kea, ko) {
  "use strict";

  var SherlockVm;

  SherlockVm = function SherlockVm() {
    kea.viewmodels.Parent.apply(this);
    kea.viewmodels.Child.apply(this);

    var that = this;

    this.options               = ko.observable();
    this.providers             = ko.observableArray([]);
    this.providerSearchTerm    = ko.observable('').extend({ rateLimit: { timeout: 500, method: "notifyWhenChangesStop" } });
    this.providerSearchActive  = ko.observable(false);
    this.showLiveSearchWidgets = ko.observable(false);
    this.activeFragments       = ko.observableArray([]);
    
    this.params = ko.computed(function() {
      var params = {};
      
      this.providers().forEach(function(provider) {
        var param = provider.fragmentsToParam();
        
        if (param) {
          params = $.extend({}, params, param);
        }
      });
      
      if ( this.options() ) {
        if (this.options().presetParameters) {
          params = $.extend({}, this.options().presetParameters, params);
        }
        
        if (this.options().fixedParameters) {
          params = $.extend({}, params, this.options().fixedParameters);
        }
      }
      
      return params;
      
    }, this, {deferEvaluation: true});
    
    this.fragmentsForSearchTerm           = ko.observableArray([]);
    this.orderedFragmentsForSearchTerm    = ko.computed(function() {
      if (!this.fragmentsForSearchTerm()) {
        return;
      }
      
      return this.fragmentsForSearchTerm.sort(function(left, right) {
        if (left.confidence === right.confidence) {
          return 0;
        }
        
        return left.confidence < right.confidence ? 1 : -1;
      });
      
    }, this, {deferEvaluation: true});
    
    this.availableProviders = ko.computed(function() {
      var available = [];
      
      this.providers().forEach(function(provider) {
        if (provider.allowAnotherFragment()) {
          available.push(provider);
        }
      });
      
      return available;
      
    }, this, {deferEvaluation: true});
    
    this.liveSearchProviders = ko.computed(function() {
      var available = [];
      
      this.providers().forEach(function(provider) {
        if (provider.offersLiveSearch()) {
          available.push(provider);
        }
      });
      
      return available;
      
    }, this, {deferEvaluation: true});
    
    this.focuseableFragments = ko.computed(function() {
      var fragments = [];
      
      this.orderedFragmentsForSearchTerm().forEach(function(fragment) {
        fragments.push(fragment);
      });
      
      this.liveSearchProviders().forEach(function(provider) {
        provider.liveSearchFragments().forEach(function(fragment) {
          fragments.push(fragment);
        });
      });
      
      return fragments;
      
    }, this, {deferEvaluation: true});
    
    this.focusNextFragment = function focusNextFragment() {
      if (that.focuseableFragments().length === 0) {
        return;
      }
      
      var result = that.focuseableFragments().some(function(fragment, idx) {
        var nextFragment;
        
        if (!fragment.hasFocus()) {
          return false;
        }
        
        nextFragment = that.focuseableFragments()[idx + 1];
        
        if (nextFragment) {
          fragment.hasFocus(false);
          nextFragment.hasFocus(true);
        }
        
        return true;
      });
      
      if (!result) {
        that.focuseableFragments()[0].hasFocus(true);
      }
      
    };
    
    this.focusPreviousFragment = function focusPreviousFragment() {
      if (that.focuseableFragments().length === 0) {
        return;
      }
      
      var result = that.focuseableFragments().some(function(fragment, idx) {
        var previousFragment;
        
        if (!fragment.hasFocus()) {
          return false;
        }
        
        previousFragment = that.focuseableFragments()[idx - 1];
        
        if (previousFragment) {
          fragment.hasFocus(false);
          previousFragment.hasFocus(true);
        }
        
        return true;
      });
      
      if (!result) {
        that.focuseableFragments()[0].hasFocus(true);
      }
    };
    
    this.selectFocusedFragment = function selectFocusedFragment() {
      var fragment = ko.utils.arrayFirst(that.focuseableFragments(), function(fragment) {
        return fragment.hasFocus();
      });
      
      if (fragment) {
        that.selectFragment(fragment);
      }
    };
    
    this.removeLastActiveFragment = function removeLastActiveFragment() {
      var fragment = that.activeFragments()[ that.activeFragments().length - 1 ];
      
      if (fragment) {
        that.removeFragment(fragment);
      }
    };
    
    this.setDefaultFragments = function setDefaultFragments() {
      that.availableProviders().forEach(function(provider) {
        that.fragmentsForSearchTerm.push( provider.defaultFragment() );
      });
    };
    
    this.selectFragment = function selectFragment(fragment) {
      that.activeFragments.push(fragment);
      fragment.provider.activeFragments.push(fragment);
      that.providerSearchActive(false);
      that.fragmentsForSearchTerm([]);
      that.providerSearchTerm('');
    };
    
    this.removeFragment = function removeFragment(fragment) {
      fragment.provider.activeFragments.remove(fragment);
      that.activeFragments.remove(fragment);
    };
    
    this.providerSearchTerm.subscribe(function(searchTerm) {
      var fragments;
    
      that.fragmentsForSearchTerm([]);
      
      if (searchTerm.length > 0) {
        that.showLiveSearchWidgets(true);
        
        that.availableProviders().forEach(function(provider) {
          fragments = provider.respondsTo(searchTerm);
          
          if (fragments) {
            fragments.forEach(function(fragment) { that.fragmentsForSearchTerm.push(fragment); });
          }
        });
        
        // fragments[0].hasFocus(true);
        
      } else {
        if (that.providerSearchActive()) {
          that.setDefaultFragments();
          that.showLiveSearchWidgets(false);
        }
      }
    });
    
    this.providerSearchActive.subscribe(function(isActive) {
      if (!isActive) {
        return;
      }
      
      if (that.fragmentsForSearchTerm().length === 0) {
        that.setDefaultFragments();
        that.showLiveSearchWidgets(false);
        
        that.liveSearchProviders().foreach(function(provider) {
          provider.resetLiveSearch();
        });
      }
    });
    
    this.setup = function setup(options) {
      that.options(options || {});
      
      if (that.options().providers) {
        
        that.options().providers.forEach(function(providerName) {
          that.providers.push( new app.sherlock.providers[providerName]() );
        });
        
      } else {
        
       for (var providerName in app.sherlock.providers) {
         if (app.sherlock.providers.hasOwnProperty(providerName)) {
           that.providers.push( new app.sherlock.providers[providerName]() );
         }
       }

      }
    };
  };

  app.sherlock.SherlockVm = SherlockVm;

})(window.app, window.kea, ko);