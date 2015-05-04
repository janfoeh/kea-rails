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
    unserializable_attributes = []
    serializable_attribute_strings = ""
    attribute_initializers    = []
    
    ['created_at', 'updated_at'].each do |attribute|
      unserializable_attributes << attribute if @klass.attribute_names.include?(attribute)
    end
    
    attribute_initializers << "this.unserializableAttributes(#{unserializable_attributes.collect { |a| "'#{a}'"}.join(", ")});"
    
    @model_attributes.in_groups_of(5, false) do |group|
      serializable_attribute_strings << '      ' + group.collect { |attribute| "'#{attribute}'" }.join(', ') + ",\n"
    end
    
    serializable_attribute_strings.gsub!(/,\n\z/, "\n")
    
    attribute_initializers << "this.serializableAttributes(\n#{serializable_attribute_strings}    );"
    
    @model_associations.each do |assoc|
      attribute_initializers << case assoc.macro
                                when :has_one
                                  "this.hasOne('#{assoc.name.to_s.singularize.camelize}');"
                                when :has_many
                                  "this.hasMany('#{assoc.name.to_s.singularize.camelize}', '#{assoc.name}');"
                                end
    end
    
    attribute_initializers
  end
end
