Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root 'pages#index'

  get 'login', to: 'wallets#login'
  # get 'trezor_wallet_login', to: 'pages#trezor_wallet_login'
  # get 'trezor_wallet', to: 'wallets#trezor_wallet'

  get 'logout', to: 'wallets#logout'
  get 'forgot_password', to: 'pages#forgot_password'

  get 'portfolio', to: 'wallets#index'
  get 'get_balances', to: 'wallets#get_balances'
  get 'get_balance', to: 'wallets#get_balance'
  get 'calculate_max_allowed_amount', to: 'wallets#calculate_max_allowed_amount'
  get 'fetching_balances', to: 'pages#fetching_balances'

  get 'transactions', to: 'wallets#transactions'
  get 'trust_asset', to: 'wallets#trust_asset'
  get 'assets', to: 'wallets#browse_assets'
  get 'fetch_next_assets', to: 'wallets#fetch_next_assets'

  get 'account', to: 'wallets#stellar_account'
  get 'new_account', to: 'wallets#new_account'
  get 'federation_account', to: 'wallets#federation_account'
  get 'get_federation_address', to: 'wallets#get_federation_address'
  get 'send_money', to: 'wallets#transfer_assets'

  get 'inactive_account', to: 'wallets#inactive_account'
  get 'success', to: 'wallets#success'
  get 'failed', to: 'wallets#failed'
  get 'help', to: 'pages#help'
  post 'create_log', to: 'application#create_log'

  resources :federations
end
