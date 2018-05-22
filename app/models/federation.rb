class Federation < ApplicationRecord
  validates_format_of :username, without: /[<*,>]+\z/
end
