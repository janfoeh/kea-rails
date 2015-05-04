class Kea::InstallGenerator < Rails::Generators::Base
  source_root File.expand_path('../templates', __FILE__)
  argument :namespace, type: :string, required: false, default: nil
 
  def init_js
    copy_file "init.js", namespaced_path("app/assets/javascripts/", "init.js")
  end
 
  def directories
    empty_directory namespaced_path("app/assets/javascripts", "bindings")
    create_file     namespaced_path("app/assets/javascripts", "bindings/.keep")
    empty_directory namespaced_path("app/assets/javascripts", "extenders")
    create_file     namespaced_path("app/assets/javascripts", "extenders/.keep")
    empty_directory namespaced_path("app/assets/javascripts", "initializers")
    empty_directory namespaced_path("app/assets/javascripts", "models")
    create_file     namespaced_path("app/assets/javascripts", "models/.keep")
    empty_directory namespaced_path("app/assets/javascripts", "services")
    create_file     namespaced_path("app/assets/javascripts", "services/.keep")
    empty_directory namespaced_path("app/assets/javascripts", "viewmodels")
    empty_directory namespaced_path("app/assets/javascripts", "components")
    create_file     namespaced_path("app/assets/javascripts", "components/.keep")
    empty_directory namespaced_path("app/assets/javascripts", "sherlock")
    create_file     namespaced_path("app/assets/javascripts", "sherlock/.keep")
  end
 
  def global_initializer
    copy_file "global.js", namespaced_path("app/assets/javascripts/", "initializers/global.js")
  end
  
  def main_viewmodel
    copy_file "main.js", namespaced_path("app/assets/javascripts/", "viewmodels/main.js")
  end
 
  def application_js
    insert_into_file namespaced_path("app/assets/javascripts", "application.js"), :after => "jquery_ujs\n" do <<-'JS'
//= require kea/kea_dependencies

//= require ./init

//= require kea/kea
//= require_directory ./bindings
//= require_directory ./extenders
//= require_directory ./models
//= require_directory ./services
//= require ./viewmodels/main
//= require_directory ./viewmodels
//= require_directory ./components

//= require_directory ./sherlock

//= require_directory ./initializers
    JS
    end
    
    append_to_file namespaced_path("app/assets/javascripts", "application.js") do <<-'JS'


$(document).ready(function() {
  "use strict";

  $.ajaxSetup({
    timeout: 30000
  });

  window.app.page.MainVm = new window.app.viewmodels.Main();
  
  var $body = $('body');
    
  app.initializers.forEach(function(initializer) {
    
    if (initializer.selectors.length === 0) {
      initializer.callback();
      return;
    }
    
    initializer.selectors.forEach(function(selector) {
      if (selector.charAt(0) === '#') {
        if ($body.attr('id') === selector.slice(1, selector.length)) {
          initializer.callback();
        }
        
      } else if (selector.charAt(0) === '.') {
        if ($body.hasClass(selector)) {
          initializer.callback();
        }
      }
    });
    
  });

  ko.applyBindings(app.page.MainVm);
  
  app.page.MainVm.pageInitComplete(true);
  
  if (app.errors.length > 0) {
    app.errors.forEach(function(error) {
      kea.notify(error.message, error.level);
    });
  }
  
});
    JS
    end
  end
  
  def application_css
    copy_file "_komplete.sass", namespaced_path("app/assets/stylesheets", "_komplete.sass")
    copy_file "_sherlock.sass", namespaced_path("app/assets/stylesheets", "_sherlock.sass")
    
    insert_into_file namespaced_path("app/assets/stylesheets", "application.css.sass"), "*= require kea/kea\n", :before => "*= require_self"
    
    append_to_file namespaced_path("app/assets/stylesheets", "application.css.sass") do <<-'CSS'
+keyframes(overlay)
  0%
    +transform(translateY(-100%) scale(0.8))
    box-shadow: 0px 40px 20px 5px $grey-20
  50%
    +transform(translateY(0%) scale(0.8))
    box-shadow: 0px 0px 20px 5px $grey-20
  90%
    +transform(translateY(0%) scale(0.8))
    box-shadow: 0px 0px 20px 5px $grey-20
  100%
    +transform(translateY(0%) scale(1))
    box-shadow: 0px 0px 0px 0px $grey-20

// Imported elements

@import sherlock
@import komplete

.attache-popover
  display: none
  position: absolute
  z-index: 2
  padding: 1em
  opacity: 0
  transition: opacity 0.3s ease
  +triangles(grey)
  &.inactive
    display: none
  &.activating, &.active
    display: block
  &.active
    opacity: 1
  &.formerror
    z-index: 11
    background: opacify(red, 0.3)
    border-color: red
    color: white
    +triangles(opacify(red, 0.3))

.veil-overlay
  position: fixed
  top: 0
  left: 0
  display: none
  z-index: 10
  // +transition(all 1s $cubic-transition)
  // +transform(scale(0.5))
  &.fullscreen
    width: 100%
    height: 100vh
    padding: 2rem
  &.activating, &.active, &.deactivating
    display: block
    visibility: visible
  &.active
    +animation(overlay 1s $cubic-transition 0s 1 normal forwards)
  &.deactivating
    +transform(scale(0))
    // +animation(overlay 1s $cubic-transition 0s 1 reverse forwards)
    CSS
    end
  end
   
  def layout_setup
    copy_file "application.html.erb", "app/views/layouts/#{namespace ? namespace.underscore : "application"}.html.erb"
  end
  
  def helpers
    inject_into_class "app/controllers/application_controller.rb", ApplicationController do
      "  helper Kea::ApplicationHelper\n"
    end
  end
  
    private
    
  def namespaced_path(path, suffix = nil)
    app_namespace = case namespace
    when 'none', nil
      nil
    else
      namespace.underscore
    end
    
    File.join [path, app_namespace, suffix].compact
  end
  
end
