class Kea::ServiceGenerator < Rails::Generators::NamedBase
  source_root File.expand_path('../templates', __FILE__)
  argument :namespace, type: :string, required: false, default: nil
  
  def install_templates
    template "service.js.erb", namespaced_path("app/assets/javascripts", "services/#{name.underscore}.js")
  end
  
    private
    
  def namespaced_path(path, suffix = nil)
    File.join [path, namespace.underscore, suffix].compact
  end
end
