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
    create_file     namespaced_path("app/assets/javascripts", "initializers/.keep")
    empty_directory namespaced_path("app/assets/javascripts", "models")
    create_file     namespaced_path("app/assets/javascripts", "models/.keep")
    empty_directory namespaced_path("app/assets/javascripts", "services")
    create_file     namespaced_path("app/assets/javascripts", "services/.keep")
    empty_directory namespaced_path("app/assets/javascripts", "viewmodels")
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

//= require init

//= require kea/kea
//= require_directory ./bindings
//= require_directory ./extenders
//= require_directory ./models
//= require_directory ./services
//= require ./viewmodels/main
//= require_directory ./viewmodels

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
      app.notify(error.message, error.level);
    });
  }
  
});
    JS
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
