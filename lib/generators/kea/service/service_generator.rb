class Kea::ServiceGenerator < Rails::Generators::NamedBase
  source_root File.expand_path('../templates', __FILE__)
  
  def install_templates
    template "service.js.erb", "app/assets/javascripts/services/#{name.underscore}.js"
  end
end
