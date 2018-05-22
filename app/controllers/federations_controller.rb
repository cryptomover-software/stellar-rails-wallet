class FederationsController < ApplicationController
  def index
    
  end

  def create
    begin
      federation = Federation.new(federations_params)
      federation.address = session[:address]
      federation.save!
      # ToDo Rescue saving errors

      redirect_to federation_account_path
    rescue
      flash[:notice] = "Invalid Username. Do not type * OR Domain Name. These characters <*,> are not allowed."
      redirect_to federation_account_path
    end
  end

  private
  def federations_params
    params.require(:federation).permit(:username)
  end

end
