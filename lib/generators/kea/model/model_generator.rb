class Kea::ModelGenerator < Rails::Generators::NamedBase
  source_root File.expand_path('../templates', __FILE__)
  argument :namespace, type: :string, required: false, default: nil
  
  def install_templates
    template "model.js.erb", namespaced_path("app/assets/javascripts", "models/#{name.underscore}.js")
  end
  
    private
    
  def namespaced_path(path, suffix = nil)
    File.join [path, namespace.underscore, suffix].compact
  end
end
