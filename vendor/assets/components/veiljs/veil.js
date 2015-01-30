// Expose plugin as an AMD module if AMD loader is present:
(function (factory) {
  'use strict';

  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else {
    window.Veil = factory(jQuery);
  }

}(function ($) {
  'use strict';

  /**
   * Veil
   *
   * @class
   * @global
   * @param {Object} [options]
   * @param {String} [options.overlayClass] - additional CSS class(es) to apply to the overlay markup
   * @param {Boolean} [options.listenToCustomEvents=false] - listen to 'close.veil' on the overlay element
   * @param {Boolean} [options.debug=false] - provide debug information and error handling in the console
   *
   * @param {Object} [callbacks] - callbacks to be triggered at various lifecycle moments
   * @param {afterCreateCallback} [callbacks.afterCreate] - called after the overlay markup has been created
   * @param {afterShowCallback} [callbacks.afterShow] - called each time after the overlay is shown
   */
  function Veil(options, callbacks) {
    var that = this;

    this.$overlay;

    this.options = $.extend({}, this.defaults, options);

    this.callbacks = {
      'afterCreate':  [],
      'beforeShow':   [],
      'afterShow':    [],
      'afterHide':    []
    };

    if (typeof callbacks !== 'undefined') {
      for(var callbackName in callbacks){
         if (callbacks.hasOwnProperty(callbackName)) {
           this.addCallback(callbackName, callbacks[callbackName]);
         }
      }
    }

    this.initialize();
  }

  // Veil "class methods"

  /**
   * Options affecting all Veil instances
   *
   * @memberOf Veil
   * @static
   * @public
   */
  Veil.globalOptions = {
    /**
     * The markup used to create the backdrop. Set to null to disable the backdrop
     */
    backdropMarkup: "<div class='veil-backdrop'></div>",
    /**
     * see README for information
     */
    cssTransitionSupport: true
  };

  /**
   * A jQuery object of the backdrop DOM element
   *
   * @memberOf Veil
   * @static
   * @public
   */
  Veil.$backdrop = null;

  /**
   * All instances that are currently active on the page
   *
   * @memberOf Veil
   * @static
   * @private
   */
  Veil.activeInstances = [];

  /**
   * Activate an overlay instance
   *
   * @memberOf Veil
   * @static
   * @private
   * @param {Veil} instance
   */
  Veil.instanceActivates = function instanceActivates(instance) {
    if (!Veil.backdropExists() && Veil.globalOptions.backdropMarkup !== null) {
      Veil.$backdrop = $(Veil.globalOptions.backdropMarkup);

      $('body').append(Veil.$backdrop);
    }

    if (Veil.backdropExists() && !Veil.backdropIsActive()) {
      Veil.activateElement(Veil.$backdrop);
    }

    Veil.activeInstances.push(instance);
  };

  /**
   * Deactivate an overlay instance
   *
   * @memberOf Veil
   * @static
   * @private
   * @param {Veil} instance
   */
  Veil.instanceDeactivates = function instanceDeactivates(instance) {
    var indexPosition = Veil.activeInstances.indexOf(instance);

    if (indexPosition !== -1) {
      Veil.activeInstances.splice(indexPosition, 1);
    }

    if (Veil.activeInstances.length === 0 && Veil.backdropIsActive()) {
      Veil.deactivateElement(Veil.$backdrop);
    }
  };

  /**
   * Marks a DOM element as active through CSS classes
   *
   * @memberOf Veil
   * @static
   * @private
   * @param {jQuery} $element
   */
  Veil.activateElement = function activateElement($element) {
    $element.addClass('activating');

    // use a timeout to make sure adding and removing .activating is not
    // coalesced into a single step
    setTimeout(function(){
      $element.removeClass('activating').addClass('active');
    }, 1);
  };

  /**
   * Marks a DOM element as not active through CSS classes
   *
   * @memberOf Veil
   * @static
   * @private
   * @param {jQuery} $element
   */
  Veil.deactivateElement = function deactivateElement($element) {
    $element.removeClass('active');

    if (Veil.globalOptions.cssTransitionSupport) {
      $element.addClass('deactivating');

      $element.one('transitionend webkitTransitionEnd', function() {
        $element.removeClass('deactivating');
      });
    }
  };

  /**
   * Does the backdrop markup exist in the DOM?
   *
   * .closest('html') lets us test whether the element actually exists in the DOM
   * or has been removed from it
   * -> http://stackoverflow.com/a/3086084/100342 (comments)
   *
   * @memberOf Veil
   * @static
   * @private
   */
  Veil.backdropExists = function backdropExists() {
    return Veil.$backdrop !== null && Veil.$backdrop.closest('html').length === 1;
  };

  /**
   * Is the backdrop currently active?
   *
   * @memberOf Veil
   * @static
   * @private
   */
  Veil.backdropIsActive = function backdropIsActive() {
    return Veil.backdropExists() && (Veil.$backdrop.hasClass('activating') || Veil.$backdrop.hasClass('active'));
  };

  // Veil "instance methods"

  Veil.prototype = (function() {

    var defaults,
        initialize,
        show,
        hide,
        destroy,
        overlay,
        exists,
        isActive,
        setContent,
        addCallback,
        _createMarkup,
        _hasCallbackFor,
        _executeCallbacksFor,
        _debug;

    defaults = {
      debug: true
    };

    initialize = function initialize() {

    };

    /**
     * Show the overlay. Create the markup first if it does not exist yet
     *
     * @memberOf Veil
     * @instance
     * @public
     */
    show = function show() {
      var that = this;

      if ( !this.exists() ) {
        _createMarkup.call(this);
      }

      _executeCallbacksFor.call(this, 'beforeShow', this.$overlay);

      Veil.instanceActivates(this);
      Veil.activateElement(this.$overlay);

      if (this.options.listenToCustomEvents) {
        this.$overlay.on('hide.veil', function() {
          that.hide();

          return false;
        });
      }

      _executeCallbacksFor.call(this, 'afterShow', this.$overlay);
    };

    /**
     * Hide the overlay
     *
     * @memberOf Veil
     * @instance
     * @public
     */
    hide = function hide() {
      if (!this.isActive()) {
        return false;
      }

      Veil.instanceDeactivates(this);
      Veil.deactivateElement(this.$overlay);

      if (this.options.listenToCustomEvents) {
        this.$overlay.off('hide.veil');
        _executeCallbacksFor.call(this, 'afterHide', this.$overlay);
      }
    };

    /**
     * A jQuery object of the overlay markup in the DOM
     * 
     * @memberOf Veil
     * @instance
     * @public
     * @returns {jQuery}
     */
    overlay = function overlay() {
      if ( !this.exists() ) {
        _createMarkup.call(this);
      }

      return this.$overlay;
    };

    /**
     * Does the overlay markup exist in the DOM?
     *
     * @memberOf Veil
     * @instance
     * @public
     * @returns {Boolean}
     */
    exists = function exists() {
      return typeof this.$overlay !== 'undefined' && this.$overlay !== null && this.$overlay.length === 1;
    };

    /**
     * Is this overlay currently active?
     *
     * @memberOf Veil
     * @instance
     * @public
     * @returns {Boolean}
     */
    isActive = function isActive() {
      return this.exists() && (this.$overlay.hasClass('activating') || this.$overlay.hasClass('active'));
    };

    /**
     * Modifies the content markup of the overlay
     *
     * @memberOf Veil
     * @instance
     * @public
     * @param {String} content
     */
    setContent = function setContent(content) {
      this.content = content;

      if (this.exists()) {
        this.$overlay.html(this.content);
      }
    };

    /**
     * Hide the overlay, remove it from DOM and remove event handlers from the anchor element
     *
     * @memberOf Veil
     * @instance
     * @public
     */
    destroy = function destroy() {
      if ( !this.exists() ) {
        return false;
      }

      Veil.instanceDeactivates(this);

      this.$overlay.remove();
      this.$overlay = null;
    };

    /**
     * Create the popover markup in the DOM
     *
     * @memberOf Veil
     * @instance
     * @private
     */
    _createMarkup = function _createMarkup() {
      this.$overlay = $('<div class="veil-overlay"></div>').addClass(this.options.overlayClass);

      this.$overlay.html(this.content);

      $('body').append(this.$overlay);

      _executeCallbacksFor.call(this, 'afterCreate', this.$overlay);
    };

    /**
     * Add a callback that is executed at trigger
     *
     * @memberOf Veil
     * @instance
     * @public
     * @param {String} trigger - at what point in the lifecycle to trigger the callback
     * @param {Function} callback
     */
    addCallback = function addCallback(trigger, callback) {
      if (typeof this.callbacks[trigger] === 'undefined') {
         _debug.call(this, "Warning: unknown callback %s will never be triggered", trigger);
         return false;
      }

      this.callbacks[trigger].push(callback);
    };

    /**
     * Tests whether one or more callbacks are available for the given trigger
     *
     * @memberOf Veil
     * @instance
     * @private
     * @param {String} trigger
     * @returns {Boolean}
     */
    _hasCallbackFor = function _hasCallbackFor(trigger) {
      return typeof this.callbacks[trigger] !== 'undefined' && this.callbacks[trigger].length > 0;
    };

    /**
     * Execute all callbacks for a given trigger
     *
     * @memberOf Veil
     * @instance
     * @private
     * @param {String} trigger
     * @param {...mixed} arguments - arguments to be handed to the callbacks
     */
    _executeCallbacksFor = function _executeCallbacksFor(trigger) {
      var that              = this,
          callbackArguments = Array.prototype.slice.call(arguments);

      // remove the trigger name
      callbackArguments.shift();

      if (_hasCallbackFor.call(this, trigger)) {
        this.callbacks[trigger].forEach(function(cb) { cb.apply(that, callbackArguments); });
      }
    };

    /**
     * Write a debug message to console if debugging is enabled
     * 
     * @memberOf Veil
     * @instance
     * @private
     * @param {...mixed} - all arguments are handed to console.log
     */
    _debug = function _debug() {
      if (this.options.debug) {
        console.log.apply( console, Array.prototype.slice.call(arguments) );
      }
    };

    return {
      defaults: defaults,
      initialize: initialize,
      show: show,
      hide: hide,
      destroy: destroy,
      overlay: overlay,
      exists: exists,
      isActive: isActive,
      setContent: setContent,
      addCallback: addCallback
    };
  })();

  return Veil;
}));

/**
 * Callback called after the overlay markup has been created
 *
 * @callback afterCreateCallback
 * @this Veil
 *
 * @param {jQuery} overlayElement
 */

/**
 * Callback called after a overlay has been displayed
 *
 * @callback afterShowCallback
 * @this Veil
 *
 * @param {jQuery} overlayElement
 */