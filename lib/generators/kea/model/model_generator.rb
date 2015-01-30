class Kea::ModelGenerator < Rails::Generators::NamedBase
  source_root File.expand_path('../templates', __FILE__)
  
  def install_templates
    template "model.js.erb", "app/assets/javascripts/models/#{name.underscore}.js"
  end
end
