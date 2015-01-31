(function(app, sherlock, ko, Fuse) {
  "use strict";

  var Base;

  Base = function Base() {
    var that = this;
    
    this.minimumConfidence = 0.8;
    this.displayName = '';
    this.defaultKeyword = '';
    this.parameterName = '';
    this.keywords = [];
    this.activeFragments = ko.observableArray([]);
    this.prefilledFragmentsAreChangeable = true;
    
    this.liveSearchFragments    = ko.observableArray([]);
    this.liveSearchAjaxActivity = ko.observable(false);
    this.liveSearchAlwaysVisible = ko.observable(false);
    
    this.liveSearchVisible = ko.computed(function() {
      return this.liveSearchAlwaysVisible() || this.liveSearchFragments().length > 0;
    }, this, {deferEvaluation: true});
    
    this.offersLiveSearch = ko.computed(function() {
      return typeof this.liveSearch === 'function' && this.allowAnotherFragment();
    }, this, {deferEvaluation: true});
    
    this.fragmentsToParam = ko.computed(function() {
      var result                      = {},
          values                      = [];
          
      this.activeFragments().forEach(function(activeFragment) {
        var fragmentResult = activeFragment.toParam();
        
        if (!fragmentResult) {
          return;
        }
        
        values.push(fragmentResult);
      });
      
      if (values.length === 0) {
        return;
        
      } else if (values.length === 1) {
        result[this.parameterName] = values[0];
        
      } else {
        result[this.parameterName] = values;
      }
      
      return result;
          
    }, this, {deferEvaluation: true});
  };
  
  Base.prototype.allowAnotherFragment = function allowAnotherFragment() {
    return this.activeFragments().length === 0;
  };

  Base.prototype.setStaticKeywords = function setStaticKeywords(stringOrArray) {
    var that = this,
        keywords,
        defaultKeyword;
    
    if (typeof stringOrArray === 'string') {
      keywords = [stringOrArray];
    } else {
      keywords = stringOrArray;
    }
    
    this.keywords.push( {keyword: keywords.shift(), isDefaultKeyword: true} );
    
    keywords.forEach(function(keyword) {
      that.keywords.push( {keyword: keyword} );
    });
  };
  
  Base.prototype.respondsTo = function respondsTo(searchTerm) {
    if (this.offersLiveSearch()) {
      this.liveSearch(searchTerm);
    }
    return this.fuzzyKeywordSearch(searchTerm);
  };
  
  Base.prototype.fuzzyKeywordSearch = function fuzzyKeywordSearch(searchTerm) {
    var that          = this,
        fuse_results  = new Fuse(that.keywords, {
          keys: ['keyword'],
          includeScore: true,
          threshold: (1 - this.minimumConfidence)
        }).search(searchTerm),
        matches;
    
    if (!fuse_results) {
      return;
    }
    
    matches = fuse_results.map(function(fuse_result) { return new that.KeywordMatch(fuse_result); });
    
    matches = matches.map(function(match) {
      return that.fragmentForMatch(match);
    });
    
    return matches.length > 0 ? matches : null;
  };
  
  Base.prototype.fragmentForMatch = function fragmentForMatch(match) {
    var fragment = new this.Fragment(this);
    
    fragment.importMatch(match);
    
    if (typeof this.fragmentDisplayStringForMatch === 'function') {
      fragment.displayString = this.fragmentDisplayStringForMatch(match);
      
    } else {
      if (match.isDefaultKeyword) {
        fragment.displayString = '<span class="keyword default-keyword">' + match.keyword + '</span>';
      } else {
        fragment.displayString = '<span class="keyword">' + match.keyword + '</span> — <span class="keyword default-keyword">' + this.displayName + '</span>';
      }
    }
    
    return fragment;
  };
  
  Base.prototype.defaultFragment = function defaultFragment() {
    return new this.Fragment(this, this.displayName, 1);
  };
  
  Base.prototype.KeywordMatch = function KeywordMatch(fuse_result) {
    this.isDefaultKeyword = fuse_result.item.isDefaultKeyword || false;
    this.item             = fuse_result.item;
    this.keyword          = fuse_result.item.keyword;
    this.searchValue      = fuse_result.item.searchValue;
    this.predicate        = fuse_result.item.predicate;
    this.confidence       = 1 - fuse_result.score;
  };
  
  Base.prototype.Fragment = function BaseFragment(provider, displayString, confidence, searchValue, predicate) {
    var that = this;
    
    this.provider      = provider;
    
    this.displayString = displayString;
    this.confidence    = confidence;
    this.searchValueDisplay = displayString;
    this.searchValueOptions = ko.observableArray([]);
    this.predicateOptions = ko.observableArray([]);
    this.searchValue   = ko.observable(searchValue);
    this.predicate     = ko.observable(predicate);
    this.hasFocus       = ko.observable(false);
    
    if (typeof provider.searchValueOptions === 'function') {
      this.searchValueOptions( provider.searchValueOptions() );
    }
    
    if (typeof provider.predicateOptions === 'function') {
      this.predicateOptions( provider.predicateOptions() );
    }
    
    this.importMatch = function importMatch(match) {
      if (match.searchValue) {
        this.searchValue(match.searchValue);
      }
      
      if (match.predicate) {
        this.searchValue(match.predicate);
      }
      
      this.confidence = match.confidence;
    };
    
    this.changeable = !this.searchValue() || provider.prefilledFragmentsAreChangeable;
    
    this.toParam = ko.computed(function() {
      if (!this.searchValue()) {
        return;
      }
      
      if (this.predicate()) {
        return {
          predicate: this.predicate(),
          value: this.searchValue()
        };
        
      } else {
        return this.searchValue();
      }
      
    }, this, {deferEvaluation: true});
    
  };
  
  Base.prototype.fragment_template_name   = 'sherlock-base-fragment-template';
  Base.prototype.livesearch_template_name = 'sherlock-base-livesearch-template';

  app.sherlock.BaseProvider = Base;

})(window.app, window.app.sherlock, ko, window.Fuse);