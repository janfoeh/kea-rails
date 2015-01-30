class Kea::ViewmodelGenerator < Rails::Generators::NamedBase
  source_root File.expand_path('../templates', __FILE__)
  
  def install_templates
    template "viewmodel.js.erb", "app/assets/javascripts/viewmodels/#{name.underscore}.js"
  end
end
