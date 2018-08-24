class PagesController < ApplicationController
  before_action :user_must_login, only: :fetching_balances

  def index
    redirect_to portfolio_path and return if session[:address].present?
  end

  def trezor_wallet_login; end

  def help; end

  def fetching_balances; end
end
