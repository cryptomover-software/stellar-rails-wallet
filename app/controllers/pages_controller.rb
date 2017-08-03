class PagesController < ApplicationController
  def index
    @index_names = %w[CM3 CM10 CME CM3x2]
    @index_desc = ["Most Liquid coins index", "Market Representative Index", "Emerging Coin Index", "2X CM3 Exposure Index"]
    @index_yield = ["+ 317% YTD", "+350% YTD", "+50%(Since Jul 4, 2017)", "+13% (Since Jul 01, 2017)"]
    @value_changes = [+1.8, -0.5, -1.5, +3.6]

    quantities = {"B": 10, "E": 25, "L": 5}
    current_prices = {"B": 200000, "E": 150000, "L": 50000}
    @cm3_price = quantities.values.zip(current_prices.values).map { |x, y| x * y}.inject(:+)
    @index_values = [@cm3_price, 321.61, 500.2, 450.2]
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
end
