class FederationsController < ApplicationController
  def index
    
  end

  def create
    federation = Federation.new(federations_params)
    federation.address = session[:address]
    federation.save!

    redirect_to federation_account_path
  end

  private
  def federations_params
    params.require(:federation).permit(:address, :username)
  end
end
