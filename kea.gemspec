$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "kea/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "kea"
  s.version     = Kea::VERSION
  s.authors     = ["Jan-Christian Foeh"]
  s.email       = ["jan@programmanstalt.de"]
  s.homepage    = "http://www.programmanstalt.de"
  s.summary     = "A collection of helpers for structuring Knockout.js applications"
  s.description = "A collection of helpers for structuring Knockout.js applications"
  s.license     = "MIT"

  s.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.rdoc"]
  s.test_files = Dir["test/**/*"]

  s.add_dependency "rails", "~> 4.1"
  
  s.post_install_message = %q{
  Installation
  -----------

  run

      rails g kea:install

  for setup.
  }
end