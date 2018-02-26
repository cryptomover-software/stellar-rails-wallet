class WalletsController < ApplicationController
  before_action :user_must_login, except: [:login, :new_account]
  
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
      session[:address] = params[:public_key].delete(' ')
      
      redirect_to portfolio_path
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
  end

  def get_data_from_stellar_api(endpoint)
    url = STELLAR_API + endpoint
    response = HTTParty.get(url)
    JSON.parse(response.body)
    # TODO handle API url down
  end

  def get_balances()
    address = session[:address]
    endpoint = "/accounts/#{address}"
    body = get_data_from_stellar_api(endpoint)

    body['status'] == 404 ? body['status'] : body['balances']
  end

  def set_cursor(url, cookie)
    url = url['href']
    
    url_params = CGI::parse(URI::parse(url).query)

    if cookie == 'next'
      session[:next_cursor] = url_params['cursor']
    else
      session[:prev_cursor] = url_params['cursor']
    end
  end

  def set_transactions_endpoint
    endpoint = "/accounts/#{session[:address]}/payments?limit=3"
    
    if (params[:cursor])
      endpoint += "&cursor=#{params[:cursor]}"
    end

    if params[:order] == 'asc_order'
      endpoint += "&order=asc"
    else
      endpoint += "&order=desc"
    end
  end
  
  def get_transactions
    endpoint = set_transactions_endpoint()

    body = get_data_from_stellar_api(endpoint)

    url = body['_links']['next']
    set_cursor(url, 'next')

    url = body['_links']['prev']
    set_cursor(url, 'prev')
    
    if body['_embedded']['records'].present?
      return body['_embedded']['records']
    else
      []
    end

    respond_to do |format|
      format.html
    end
    
  end

  def index
    @balances = get_balances()
    
    session[:balances] = @balances
    session[:next_cursor] = nil
    session[:prev_cursor] = nil

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
    
    @transactions = get_transactions()

    respond_to do |format|
      format.html { @transactions }
      format.json { render json: body['_embedded']['records']}
    end
  end

  def transfer_assets
    @balances = session[:balances]
  end

  def fund_new_account
    @to_address = params[:to_address]
    @from_address = params[:from_address]
    @amount = params[:amount]
  end

  def success
  end

  def failed
  end

  private
  
  def user_must_login
    if not session[:address].present?
      redirect_to root_path
    end
  end
end
