class FederationsController < ApplicationController
  def index
    
  end

  def sync_with_federation_database(federation)
    
  end
  handle_asynchronously :sync_with_federation_database

  def create
    federation = Federation.new(federations_params)
    federation.address = session[:address]
    federation.save!
    # ToDo Move this syncing to background job
    # and asynchronously
    sync_with_federation_database(federation)

    redirect_to federation_account_path
  end

  private
  def federations_params
    params.require(:federation).permit(:address, :username)
  end

end
