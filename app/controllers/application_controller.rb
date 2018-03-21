class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  private
  def user_must_login
    if not session[:address].present?
      session.clear
      flash[:notice] = "User Not Logged In OR Session Expired."
      redirect_to root_path
    end
  end
end
