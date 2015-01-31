class Kea::ModelGenerator < Rails::Generators::NamedBase
  source_root File.expand_path('../templates', __FILE__)
  argument :namespace, type: :string, required: false, default: nil, banner: "APPLICATION NAMESPACE|none"
  argument :attributes, type: :array, required: false, banner: "model_attribute1 model_attribute1 …"
  
  class_option :validatable, type: :boolean, :aliases => "-v", desc: "add model validations", default: false
  
  def install_templates
    @klass = name.camelize.safe_constantize
    
    if @klass
      @model_attributes       = reflected_model_attributes
      @model_associations     = reflected_model_associations
      @attribute_initializers = attribute_initializers
      
      if options[:validatable]
        @validators = @klass.validators.select {|v| v.is_a?(ActiveRecord::Validations::PresenceValidator) }
      end
    end
    
    template "model.js.erb", namespaced_path("app/assets/javascripts", "models/#{name.underscore}.js")
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
  
  def reflected_model_attributes
    attributes.any? ? attributes.map(&:name) : @klass.attribute_names - ["id", "created_at", "updated_at"]
  end
  
  def reflected_model_associations
    @klass.reflect_on_all_associations.select { |assoc| assoc.macro == :has_one || assoc.macro == :has_many }
  end
  
  def attribute_initializers
    max_string_length        = 0
    attribute_initializers   = []
    association_initializers = []
    
    attribute_initializers = @model_attributes.collect do |attribute_name|
      ["this.#{attribute_name}", "ko.observable();"]
    end
    
    association_initializers = @model_associations.collect do |assoc|
      if assoc.macro == :has_one
        ["this.#{assoc.name}", "ko.observable();"]
      elsif assoc.macro == :has_many
        ["this.#{assoc.name}", "ko.observableArray([]);"]
      end
    end
    
    initializers = attribute_initializers + association_initializers
    
    max_string_length = initializers.map { |a| a.first.length }.max
    
    initializers.map { |i| [i.first.ljust(max_string_length + 1), " = ", i.last].join('') }
  end
end
