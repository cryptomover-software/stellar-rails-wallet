class WalletsController < ApplicationController
  before_action :user_must_login, except: [:login]
  
  STELLAR_API = "https://horizon.stellar.org".freeze
  
  def dashboard
    # render :layout => "dashboard"
  end

  # def stellar_login
  #   if session[:address].present?
  #     redirect_to "/stellar_dashboard"
  #   else
  #     render :layout => "dashboard"
  #   end
  # end

  def login
    begin
      # if not params[:raw] == "true"
      #   seed = params[:seed].scan(/../).collect { |c| c.to_i(16).chr }.join
      #   pair = Stellar::KeyPair.from_raw_seed(seed)
      # else
      #   pair = Stellar::KeyPair.from_seed(params[:seed])
      # end
      # pair = Stellar::KeyPair.from_seed(params[:seed])

      # session[:address] = pair.address
      # session[:seed] = pair.seed
      session[:address] = params[:public_key]
      
      redirect_to wallet_path
    rescue
      flash[:notice] = "Invalid seed. Check seed again."
      redirect_to root_path
    end
  end

  def logout
    session[:address] = session[:seed] = nil
    redirect_to root_path
  end

  def account
     @address = session[:address]
     @seed = session[:seed]
  end

  def new_account
      random = Stellar::KeyPair.random
      session[:address] = @address = random.address
      session[:seed] = @seed = random.seed
#    render :layout => "dashboard"
  end

  def get_data_from_stellar_api(endpoint)
    url = STELLAR_API + endpoint
    response = HTTParty.get(url)
    JSON.parse(response.body)
    # TODO handle API url down
  end

  def get_balances(session)
    endpoint = "/accounts/#{session[:address]}"
    body = get_data_from_stellar_api(endpoint)

    body['status'] == 404 ? body['status'] : body['balances']
  end

  def get_transactions(session)
    endpoint = "/accounts/#{session[:address]}/payments?limit=50"
    body = get_data_from_stellar_api(endpoint)
    
    if body['_embedded'].present? && body['_embedded']['records'].present?
      body['_embedded']['records']
    else
      []
    end
    
  end

  def index
    if session[:balances].nil?
      @balances = get_balances(session)
    else
      @balances = session[:balances]
    end
    
    session[:balances] = @balances

    if @balances == 404
      redirect_to inactive_account_path
      return
    end
  end

  def inactive_account
  end

  def transactions
    if session[:balances] == 404
      redirect_to inactive_account_path
      return
    end
    
    @transactions = get_transactions(session)
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

    redirect_to wallet_path

  end
end
