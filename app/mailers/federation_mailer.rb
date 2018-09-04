class FederationMailer < ApplicationMailer
  layout 'mailer'

  WALLET_URL = 'https://cryptomover.tech'.freeze

  def confirm_email
    @federation = params[:federation]
    @address = params[:address]
    token = params[:token]
    @url = WALLET_URL + "/confirm_email?token=#{token}"

    mail(to: @federation,
         subject: 'Confirm Email Address for Cryptomover Stellar Federation Account')
  end
end
