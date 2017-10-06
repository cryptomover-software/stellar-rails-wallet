Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root 'pages#index'
  get 'about', to: 'pages#about'
  get 'dashboard', to: 'pages#dashboard'
  get 'trade', to: 'pages#trade'
  get 'trade1', to: 'pages#trade1'
  get 'trade2', to: 'pages#trade2'
  get 'trade3', to: 'pages#trade3'
  get 'login', to: 'pages#login'
  get 'signup', to: 'pages#signup'
  get 'forgot_password', to: 'pages#forgot_password'

  get 'stellar_login', to: 'pages#stellar_login'
  get 'stellar_account', to: 'pages#stellar_account'
  get 'stellar_dashboard', to: 'pages#stellar_dashboard'
  get 'stellar_subscribe', to: 'pages#stellar_subscribe'
  post 'stellar_subscribe', to: 'pages#stellar_subscribe'
  get 'stellar_send', to: 'pages#stellar_send'
  post 'stellar_send', to: 'pages#stellar_send'

  post 'login', to: 'pages#login'
  get 'logout', to: 'pages#logout'

  post '/shopify/checkout_create', to: 'shopify#checkout_create'
end
