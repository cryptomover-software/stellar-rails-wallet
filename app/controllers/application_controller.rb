class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  private

  def user_must_login
    unless session[:address].present?
      session.clear
      flash[:notice] = 'User Not Logged In OR Session Expired.'
      logger.debug 'User Not Logged in Or Session Expired.'
      redirect_to root_path
    end
  end
end
