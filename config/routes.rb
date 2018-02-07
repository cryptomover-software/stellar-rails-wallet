Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root 'pages#index'

  get 'dashboard', to: 'pages#dashboard'

  # get 'login', to: 'pages#login'

  get 'forgot_password', to: 'pages#forgot_password'

  get 'login', to: 'pages#login'
  get 'stellar_account', to: 'pages#stellar_account'
  get 'stellar_dashboard', to: 'pages#stellar_dashboard'
  get 'stellar_subscribe', to: 'pages#stellar_subscribe'
  post 'stellar_subscribe', to: 'pages#stellar_subscribe'
  get 'stellar_send', to: 'pages#stellar_send'
  post 'stellar_send', to: 'pages#stellar_send'

  # post 'login', to: 'pages#login'
  get 'logout', to: 'pages#logout'

  post '/shopify/checkout_create', to: 'shopify#checkout_create'
end
