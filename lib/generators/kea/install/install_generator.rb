class Kea::InstallGenerator < Rails::Generators::Base
  source_root File.expand_path('../templates', __FILE__)
 
  def init_js
    copy_file "init.js", "app/assets/javascripts/init.js"
  end
 
  def directories
    empty_directory "app/assets/javascripts/bindings"
    empty_directory "app/assets/javascripts/initializers"
    empty_directory "app/assets/javascripts/models"
    empty_directory "app/assets/javascripts/services"
    empty_directory "app/assets/javascripts/viewmodels"
  end
 
  def global_initializer
    copy_file "global.js", "app/assets/javascripts/initializers/global.js"
  end
  
  def main_viewmodel
    copy_file "main.js", "app/assets/javascripts/viewmodels/main.js"
  end
 
  def application_js
    insert_into_file "app/assets/javascripts/application.js", "//= require kea/kea\n", :after => "jquery_ujs\n"
    append_to_file "app/assets/javascripts/application.js" do <<-'JS'
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
    copy_file "application.html.erb", "app/views/layouts/application.html.erb"
  end
  
  def helpers
    inject_into_class "app/controllers/application_controller.rb", ApplicationController do
      "  helper Kea::ApplicationHelper\n"
    end
  end
end
