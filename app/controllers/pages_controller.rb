class PagesController < ApplicationController
  before_action :user_must_login, only: :fetching_balances
  
  def index
    if session[:address].present?
      redirect_to portfolio_path
      return
    end
  end

  def trezor_wallet_login
  end

  def help
  end

  def fetching_balances
  end
end
