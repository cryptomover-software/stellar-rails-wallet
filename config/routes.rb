Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root 'pages#index'

  get 'login', to: 'wallets#login'
  get 'trezor_wallet_login', to: 'pages#trezor_wallet_login'
  get 'trezor_wallet', to: 'wallets#trezor_wallet'
  get 'logout', to: 'wallets#logout'
  get 'forgot_password', to: 'pages#forgot_password'
  # post 'login', to: 'pages#login'

  get 'dashboard', to: 'wallets#dashboard'
  get 'portfolio', to: 'wallets#index'
  get 'get_balances', to: 'wallets#get_balances'
  get 'get_balance', to: 'wallets#get_balance'

  get 'transactions', to: 'wallets#transactions'
  get 'trust_asset', to: 'wallets#trust_asset'
  get 'assets', to: 'wallets#browse_assets'

  get 'account', to: 'wallets#stellar_account'
  get 'new_account', to: 'wallets#new_account'
  get 'send_money', to: 'wallets#transfer_assets'
  # get 'fund_new_account', to: 'wallets#fund_new_account'
  get 'inactive_account', to: 'wallets#inactive_account'
  get 'success', to: 'wallets#success'
  get 'failed', to: 'wallets#failed'
  
  # get 'stellar_subscribe', to: 'pages#stellar_subscribe'
  # post 'stellar_subscribe', to: 'pages#stellar_subscribe'

  # post '/shopify/checkout_create', to: 'shopify#checkout_create'
end
