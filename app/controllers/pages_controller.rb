class PagesController < ApplicationController
  def index
    @index_names = %w[CM3 CM10 CME CM3x2]
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
end
