# frozen_string_literal: true

class Federation < ApplicationRecord
  validates_format_of :username, without: /[<*,>]+\z/
  has_secure_token :email_confirmation_token
  validates :username, uniqueness: { scope: :address }
end
