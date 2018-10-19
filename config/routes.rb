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

Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root 'pages#index'

  get 'login', to: 'wallets#login'
  get 'logout', to: 'wallets#logout'
  get 'forgot_password', to: 'pages#forgot_password'

  get 'portfolio', to: 'wallets#index'
  get 'get_balances', to: 'wallets#get_balances'
  get 'get_usd_prices', to: 'wallets#get_usd_prices'
  get 'get_balance', to: 'wallets#get_balance'
  get 'calculate_max_allowed_amount', to: 'wallets#calculate_max_allowed_amount'
  get 'fetching_balances', to: 'pages#fetching_balances'

  get 'transactions', to: 'wallets#transactions'
  get 'trust_asset', to: 'wallets#trust_asset'
  get 'assets', to: 'wallets#browse_assets'
  get 'fetch_next_assets', to: 'wallets#fetch_next_assets'

  get 'account', to: 'wallets#stellar_account'
  get 'new_account', to: 'wallets#new_account'
  get 'confirm_email', to: 'federations#confirm_email'
  get 'resend_confirmation_email', to: 'federations#resend_confirmation_email'
  get 'get_federation_address', to: 'wallets#get_federation_address'
  get 'send_money', to: 'wallets#transfer_assets'
  get 'sign_transaction', to: 'wallets#sign_transaction'
  get 'advanced_settings', to: 'wallets#advanced_settings'

  get 'inactive_account', to: 'wallets#inactive_account'
  get 'success', to: 'wallets#success'
  get 'failed', to: 'wallets#failed'
  get 'help', to: 'pages#help'
  post 'create_log', to: 'application#create_log'
  get 'simulate_login_for_testing', to: 'wallets#simulate_login_for_testing'

  resources :federations
end
