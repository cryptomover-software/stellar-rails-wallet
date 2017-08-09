Rails.application.routes.draw do
  ActiveAdmin.routes(self)
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

  post '/shopify/checkout_create', to: 'shopify#checkout_create'
end
