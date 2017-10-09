class PagesController < ApplicationController
  def index
    @index_names = %w[CM3 CM10 CME CM3x2]
    @index_desc = ["Most Liquid coins index", "Market Representative Index", "Emerging Coin Index", "2X CM3 Exposure Index"]
    @index_yield = ["+ 317% YTD", "+350% YTD", "+50%(Since Jul 4, 2017)", "+13% (Since Jul 01, 2017)"]
    @value_changes = [+1.8, -0.5, -1.5, +3.6]

    # To Do - Use correct formula when real data from database is available
    # quantities = {"B": 10, "E": 25, "L": 5}
    # current_prices = {"B": 200000, "E": 150000, "L": 50000}
    # @cm3_price = quantities.values.zip(current_prices.values).map { |x, y| x * y}.inject(:+)

    @index_values = [390, 321.61, 500.2, 450.2]
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

  def stellar_login
    if session[:address].present?
      redirect_to "/stellar_dashboard"
    else
      render :layout => "dashboard"
    end
  end

  def login
    begin
      pair = Stellar::KeyPair.from_seed(params[:seed])
      session[:address] = pair.address
      session[:seed] = pair.seed
      redirect_to "/stellar_dashboard"
    rescue
      flash[:notice] = "Invalid seed, please check"
      redirect_to "/stellar_login"
    end
  end

  def logout
    session[:address] = session[:seed] = nil
    redirect_to "/stellar_login"
  end

  def stellar_account
    if session[:address].present? && session[:seed].present?
     @address = session[:address]
     @seed = session[:seed]
    else
      random = Stellar::KeyPair.random
      session[:address] = @address = random.address
      session[:seed] = @seed = random.seed
    end
    render :layout => "dashboard"
  end

  def stellar_subscribe
    if request.post?
      @account = Account.new(params.require(:account).permit(:email, :public_address, :seed))
      @account.public_address = session[:address]
      @account.seed = session[:seed]
      if @account.save
        flash[:notice] = "you subscribe success, we will send you 20 lumens."
        # str = %Q(python3 -c 'from Stellar_token_issuer import *;Account_creation("GDNRWBDBEGMO7BSVOJ5DFLWXRUZDMTABUKBN6LRWJRREKYEFAOXEFZN2", "SAFZ4JAMYXLYHIDR2YNJ3XRAGBWOMMDXYAO7UWNKOHOREKFNDXYQI6NJ", 2)')
        # result = `#{str}`
        redirect_to "/stellar_account"
      else
        flash[:notice] =  "#{@account.errors.full_messages}, please try again"
        render :layout => "dashboard"
      end
    else
      render :layout => "dashboard"
    end
  end

  def stellar_dashboard
    url = "https://horizon.stellar.org/accounts/#{session[:address]}"
    transactions_url = "https://horizon.stellar.org/accounts/#{session[:address]}/payments?limit=50"
    response = HTTParty.get(url)
    body = JSON.parse(response.body)
    @balances = body['balances'] || []

    response = HTTParty.get(transactions_url)
    body = JSON.parse(response.body)
    @transactions = body['_embedded']['records'] || []

    render :layout => "dashboard"
  end

  def stellar_send
    #@asset_name = (params[:asset_name] == "lumens") ? "XLM" : params[:asset_name]
    if params[:asset_name].blank? || params[:asset_name] == "lumens"
      str = %Q(python3 -c 'from Stellar_token_issuer import *; Sending_lumen("#{session[:address]}", "#{session[:seed]}", "#{params[:address]}", #{params[:amount]})')
    else
      asset_name, asset_address = params[:asset_name].split("|")
      str = %Q(python3 -c 'from Stellar_token_issuer import *;Sending_asset("#{asset_name}", "#{asset_address}", "#{session[:address]}", "#{session[:seed]}", "#{params[:address]}", #{params[:amount]})')
    end
    logger.info "===============================#{str}"
    result = `#{str}`

    logger.info "===============================#{result}"

    if result.index("passed")
      flash[:notice] = "Transaction passed"
    else
      flash[:notice] = "Transaction failed"
    end

    redirect_to "/stellar_dashboard"

  end
end
