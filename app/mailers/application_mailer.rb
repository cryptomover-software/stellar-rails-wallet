# frozen_string_literal: true
class ApplicationMailer < ActionMailer::Base
  default from: ENV['default_email']
  layout 'mailer'
end
