class FederationMailer < ApplicationMailer
  layout 'mailer'

  WALLET_URL = 'https://cryptomover.tech'.freeze

  def confirm_email
    @federation = params[:federation]
    token = params[:token]
    email_address = @federation.username
    @url = WALLET_URL + "/confirm_email?token=#{token}"

    mail(to: email_address,
         subject: 'Confirm Email Address for Cryptomover Stellar Federation Account')
  end
end
