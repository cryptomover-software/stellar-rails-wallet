class PagesController < ApplicationController
  STELLAR_API = "https://horizon.stellar.org".freeze
  
  def index
  end

  def dashboard
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
      # if not params[:raw] == "true"
      #   seed = params[:seed].scan(/../).collect { |c| c.to_i(16).chr }.join
      #   pair = Stellar::KeyPair.from_raw_seed(seed)
      # else
      #   pair = Stellar::KeyPair.from_seed(params[:seed])
      # end
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

  def get_data_from_stellar_api(endpoint)
    url = STELLAR_API + endpoint
    response = HTTParty.get(url)
    JSON.parse(response.body)
  end

  def get_balances(session)
    endpoint = "/accounts/#{session[:address]}"
    body = get_data_from_stellar_api(endpoint)
    return body['balances'] || []
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

  def stellar_dashboard
    @balances = get_balances(session)
    # @transactions = []
    @transactions = get_transactions(session)

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
