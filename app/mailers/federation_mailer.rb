class FederationMailer < ApplicationMailer
  layout 'mailer'

  WALLET_URL = 'https://cryptomover.tech'.freeze
  CRYPTOMOVER_SUPPORT_EMAIL = 'support@cryptomover.com'.freeze

  def confirm_email
    @federation = params[:federation]
    token = params[:token]
    email_address = @federation.username
    @url = WALLET_URL + "/confirm_email?token=#{token}"

    mail(to: email_address,
         subject: 'Confirm Email Address for Cryptomover Stellar Federation Account')
  end

  def report_new_user_registration
    @federation = params[:federation]
    email_address = CRYPTOMOVER_SUPPORT_EMAIL
    mail(to: email_address,
         subject: 'New User Registered on Wallet. Send 2 XLM.')
  end
end
