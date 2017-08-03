class PagesController < ApplicationController
  def index
    @index_names = %w[CM3 CM10 CME CM3x2]
    @index_desc = ["Most Liquid coins index", "Market Representative Index", "Emerging Coin Index", "2X CM3 Exposure Index"]
    @index_yield = ["+ 317% YTD", "+350% YTD", "+50%(Since Jul 4, 2017)", "+13% (Since Jul 01, 2017)"]
    @index_values = %w[409.2 5,321.6 1,500.2 450.2]
    @value_changes = [+1.8, -0.5, -1.5, +3.6]
  end

  def about    
  end
  
  def dashboard
    render :layout => "dashboard"    
  end
  
  def trade
    render :layout => "dashboard"        
  end
  
  def trade1
    render :layout => "dashboard"        
  end
  
  def trade2
    render :layout => "dashboard"            
  end
  
  def trade3
    render :layout => "dashboard"            
  end
  
  def login
    render :layout => "dashboard"                
  end
  
  def signup
    render :layout => "dashboard"                
  end
  
  def forgot_password
    render :layout => "dashboard"                
  end
end
