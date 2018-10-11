# frozen_string_literal: true

# LICENSE
#
# MIT License
#
# Copyright (c) 2017-2018 Cryptomover
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights to
# use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
# of the Software, and to permit persons to whom the Software is furnished to do
# so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.

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
    if @federation.save!
      session[:federation_address] = @federation.username
      session[:email_confirmed] = @federation.email_confirmed
    else
      redirect_to failed_path(type: 'email',
                              error_description: 'Email can not be confirmed. Contact Support.')
      return
    end
  end

  def resend_confirmation_email
    federation = Federation.where(address: session[:address]).first
    @username = federation.username
    message = 'ERROR! Maximum Emails sent. Contant support.'

    if federation.emails_sent < MAX_EMAILS
      # to prevent misuse of resend email functionality
      # we have set max limit of 3 emails.
      FederationMailer.with(federation: federation.username,
                            token: federation.email_confirmation_token,
                            address: federation.address).confirm_email.deliver_now
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
    if federation.username.empty?
      format.js { render json: { error: 'empty_username' }, status: :unprocessable_entity }
      return
    end

    federation.address = session[:address]
    federation.email_confirmation_generated_at = DateTime.now
    # ToDo Rescue saving errors
    @username = federation.username

    respond_to do |format|
      if federation.save!
        session[:federation_address] = @username

        FederationMailer.with(federation: @username,
                              token: federation.email_confirmation_token,
                              address: federation.address).confirm_email.deliver_now

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
