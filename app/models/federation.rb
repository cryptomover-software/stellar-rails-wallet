class Federation < ApplicationRecord
  validates_format_of :username, without: /[<*,>]+\z/
  has_secure_token :email_confirmation_token
end
