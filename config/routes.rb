Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root 'pages#index'

  get 'login', to: 'wallets#login'
  get 'logout', to: 'wallets#logout'
  get 'forgot_password', to: 'pages#forgot_password'
  # post 'login', to: 'pages#login'

  get 'dashboard', to: 'wallets#dashboard'
  get 'wallet', to: 'wallets#index'

  get 'transactions', to: 'wallets#transactions'

  get 'account', to: 'wallets#stellar_account'
  get 'new_account', to: 'wallets#new_account'
  
  get 'stellar_subscribe', to: 'pages#stellar_subscribe'
  post 'stellar_subscribe', to: 'pages#stellar_subscribe'

  get 'stellar_send', to: 'wallets#stellar_send'
  post 'stellar_send', to: 'wallets#stellar_send'

  post '/shopify/checkout_create', to: 'shopify#checkout_create'
end
