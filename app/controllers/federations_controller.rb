class FederationsController < ApplicationController
  def index
    
  end

  def confirm_email
    token = params[:token]
    @federation = Federation.where(email_confirmation_token: token).first
    redirect_to failed_path(type: 'email', error_description: 'This Email is not registered with us.') and return if @federation.nil?

    # TODO: verify 24 hour validity
    # token_validity = @federation.email_confirmation_generated_at
    # time_difference = (Time.now.to_i)-(token_validity.to_i)
    # token_invalid = time_difference <= 24 ? false : true
    # redirect_to failed_path(type: 'email', error_description: "Token Expired. Loging using your public key and generate new token.") and return if token_invalid

    @federation.email_confirmed = true
    @federation.save!
    redirect_to portfolio_path
  end

  def create
    federation = Federation.new(federations_params)
    federation.address = session[:address]
    federation.email_confirmation_generated_at = DateTime.now
    federation.save!
    # ToDo Rescue saving errors
    @username = federation.username
    FederationMailer.with(federation: federation, token: federation.email_confirmation_token).confirm_email.deliver_now

    respond_to do |format|
      format.js { @username }
    end
  end

  private
  def federations_params
    params.require(:federation).permit(:username)
  end

end
