Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root 'pages#index'
  get 'forgot_password', to: 'pages#forgot_password'

  get 'dashboard', to: 'wallets#dashboard'
  get 'transactions', to: 'wallets#transactions'

  get 'login', to: 'wallets#login'
  get 'stellar_account', to: 'wallets#stellar_account'
  get 'wallet', to: 'wallets#index'
  get 'stellar_subscribe', to: 'pages#stellar_subscribe'
  post 'stellar_subscribe', to: 'pages#stellar_subscribe'
  get 'stellar_send', to: 'wallets#stellar_send'
  post 'stellar_send', to: 'wallets#stellar_send'

  # post 'login', to: 'pages#login'
  get 'logout', to: 'wallets#logout'

  post '/shopify/checkout_create', to: 'shopify#checkout_create'
end
