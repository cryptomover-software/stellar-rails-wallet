class FederationsController < ApplicationController
  MAX_EMAILS = 3

  def index
    
  end

  def confirm_email
    # confirm user email when the user visits a valid url
    token = params[:token]
    @federation = Federation.where(email_confirmation_token: token).first
    if @federation.nil?
      redirect_to failed_path(type: 'email',
                              error_description: 'This Email is not registered with us.')
      return
    end

    if @federation.email_confirmed
      flash[:notice] = 'Email already confirmed.'
      redirect_to root_path
      return
    end

    # TODO: verify 24 hour validity
    # token_validity = @federation.email_confirmation_generated_at
    # time_difference = (Time.now.to_i)-(token_validity.to_i)
    # token_invalid = time_difference <= 24 ? false : true
    # redirect_to failed_path(type: 'email', error_description: "Token Expired. Loging using your public key and generate new token.") and return if token_invalid

    @federation.email_confirmed = true
    @federation.save!
  end

  def resend_confirmation_email
    federation = Federation.where(address: session[:address]).first
    @username = federation.username
    message = 'ERROR! Maximum Emails sent. Contant support.'

    if federation.emails_sent < MAX_EMAILS
      # to prevent misuse of resend email functionality
      # we have set max limit of 3 emails.
      FederationMailer.with(federation: federation,
                            token: federation.email_confirmation_token).confirm_email.deliver_now
      federation.emails_sent += 1
      federation.save!
      message = "Verification email sent to #{@username}"
    end

    respond_to do |format|
      format.js { render json: message }
    end
  end

  def create
    federation = Federation.new(federations_params)
    federation.address = session[:address]
    federation.email_confirmation_generated_at = DateTime.now
    # ToDo Rescue saving errors
    @username = federation.username
    FederationMailer.with(federation: federation, token: federation.email_confirmation_token).confirm_email.deliver_now

    respond_to do |format|
      if federation.save
        format.js { render json: @username }
      else
        format.js { render json: federation.errors, status: :unprocessable_entity }
      end
    end
  end

  private
  def federations_params
    params.require(:federation).permit(:username)
  end

end
