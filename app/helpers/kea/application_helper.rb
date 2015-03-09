module Kea
  module ApplicationHelper
    def body_id
      content_for?(:body_id) ? content_for(:body_id) : [body_class, params[:action]].join('-')
    end
    
    def body_class
      controller.class.to_s.gsub('Controller', '').underscore.dasherize.gsub('/', '-')
    end
    
    def json_for(target, options = {})
      options[:scope]       ||= self
      options[:url_options] ||= url_options
      
      serializer = options[:serializer] || target.active_model_serializer
      
      if target.is_a?(ActiveRecord::Relation)
        ActiveModel::ArraySerializer.new(target, each_serializer: serializer, scope: self).to_json
      else
        serializer.new(target, options).to_json
      end
    end

    def cache_json(object, path = nil, options = {})
      unless path
        path = polymorphic_path(object)
      end

      content = json_for(object, options)

      content_for :json_cache, "window.app.cache['#{path}'] = #{content};\n".html_safe
    end
    
    def knockout_template(name, partial: nil, &block)
      content_for :knockout_templates do
        if partial
          content_tag :script, type: "text/html", id: name do
            render partial: partial
          end
        else
          content_tag :script, type: "text/html", id: name do
            capture(&block)
          end
        end
      end
    end
    
    def overlay_template(name, partial: nil, &block)
      content_for :knockout_templates do
        if partial
          content_tag :script, type: "text/html", id: name, "data-bind" => "overlayTemplate: '#{name}'" do
            render partial: partial
          end
        else
          content_tag :script, type: "text/html", id: name, "data-bind" => "overlayTemplate: '#{name}'" do
            capture(&block)
          end
        end
      end
    end
  end
end