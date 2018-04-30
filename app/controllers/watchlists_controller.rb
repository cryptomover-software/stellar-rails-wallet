class WatchlistsController < ApplicationController
  def new
  end

  def create
    watchlist = Watchlist.new
    address = params[:address]
    watchlist.address = address
    watchlist.user_id = 1 
    watchlist.save!
    watchlist.process_list

    redirect_to watchlists_path
  end

  def index
    @addresses = Watchlist.all
  end

  def show; end

  private

  def watchlist_address_params
    WatchlistAddress.permit(:address)
  end
end
