Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root 'pages#index'
  get 'about', to: 'pages#about'
  get 'dashboard', to: 'pages#dashboard'  
  get 'trade', to: 'pages#trade'    
  get 'trade1', to: 'pages#trade1'      
  get 'trade2', to: 'pages#trade2'        
end
