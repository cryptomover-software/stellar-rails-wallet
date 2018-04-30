class WatchlistsController < ApplicationController
  def new
  end

  def create
    watchlist = Watchlist.new
    address = params[:address]
    watchlist.address = address
    watchlist.save!
    watchlist.process_list

    redirect_to watchlist_addresses_path
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
