class FederationMailer < ApplicationMailer
  layout 'mailer'

  WALLET_URL = 'https://cryptomover.tech'.freeze
  CRYPTOMOVER_SUPPORT_EMAIL = 'support@cryptomover.com'.freeze
  GAVIN_EMAIL = 'gavin@cryptomover.com'.freeze
  NEELABH_EMAIL = 'neelabh@cryptomover.com'.freeze

  def confirm_email
    @federation = params[:federation]
    token = params[:token]
    email_address = @federation.username
    @url = WALLET_URL + "/confirm_email?token=#{token}"

    mail(to: email_address,
         subject: 'Confirm Email Address for Cryptomover Stellar Federation Account')
  end

  def report_new_user_registration
    # report individual registration for the pupose of
    # sending 2 XLMs
    @federation = params[:federation]
    email_address = CRYPTOMOVER_SUPPORT_EMAIL
    mail(to: email_address,
         subject: 'New User Registered on Wallet. Send 2 XLM.')
  end

  def report_daily_registrations
    # report all registrations done yesterday
    @federations = params[:federations]
    subject = "Total #{@federations.count} new registration(s) on Wallet for #{Date.yesterday}"
    subject = "No new registrations on Wallet for #{Date.yesterday}" if @federations.count == 0
    mail(to: [GAVIN_EMAIL,
              NEELABH_EMAIL],
         subject: subject)
  end
end
