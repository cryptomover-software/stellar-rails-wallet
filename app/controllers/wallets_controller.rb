class WalletsController < ApplicationController
  before_action :user_must_login, except: [:login, :new_account]
  before_action :activate_account, except: [:index, :get_balances, :login, :logout, :new_account, :forgot_password, :inactive_account]
  # for Index action, we check account status each time
  # after fetching balance and after initializing the balance cookie.
  
  STELLAR_API = "https://horizon.stellar.org".freeze
  COINMARKETCAP_API = "https://api.coinmarketcap.com/v1".freeze
  NATIVE_ASSET = "native".freeze
  INVALID_LOGIN_KEY = "Invalid Public Key. Please check key again.".freeze
  UNDETERMINED_PRICE = "undetermined".freeze
  
  def dashboard
  end

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
      session.clear

      # TODO validate correct stellar public key
      session[:address] = params[:public_key].delete(' ')
      
      redirect_to portfolio_path
    rescue
      flash[:notice] = INVALID_LOGIN_KEY
      redirect_to root_path
    end
  end

  def logout
    session.clear
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

  def get_data_from_api(url)
    # TODO handle API url down
    response = HTTParty.get(url)
    JSON.parse(response.body)
  end

  def get_balances()
    address = session[:address]
    endpoint = "/accounts/#{address}"
    url = STELLAR_API + endpoint
    result = get_data_from_api(url)

    balances = result['status'] == 404 ? result['status'] : result['balances']
    
    balances = set_usd_price(balances) if balances != 404
    session[:balances] = balances

    respond_to do |format|
      format.json {render json: balances}
    end
  end

  def set_cursor(url, cookie, type)
    if type
      next_cursor = :next_asset_cursor
      prev_cursor = :prev_asset_cursor
    else
      next_cursor = :next_cursor
      prev_cursor = :prev_cursor
    end
      
    # Setting Pagination Cursor for
    # Previous and Next actions
    url = url['href']
    
    url_params = CGI::parse(URI::parse(url).query)

    if cookie == 'next'
      session[next_cursor] = url_params['cursor']
    else
      session[prev_cursor] = url_params['cursor']
    end
  end

  def set_transactions_endpoint
    endpoint = "/accounts/#{session[:address]}/payments?limit=10"
    
    endpoint += "&cursor=#{params[:cursor]}" if (params[:cursor])

    if params[:order] == 'asc'
      endpoint += "&order=asc"
    else
      endpoint += "&order=desc"
    end
  end

  def set_assets_endpoint
    endpoint = "/assets?limit=20"
    
    endpoint += "&cursor=#{params[:cursor]}" if (params[:cursor])

    if params[:order] == 'asc'
      endpoint += "&order=asc"
    else
      endpoint += "&order=desc"
    end
  end

  def set_trades_endpoint(balance)        
    endpoint = "/trades?"
    endpoint += "base_asset_type=" + balance["asset_type"]
    endpoint += "&base_asset_code=" + balance["asset_code"]
    endpoint += "&base_asset_issuer=" + balance["asset_issuer"]
    endpoint += "&counter_asset_type=#{NATIVE_ASSET}"
    endpoint += "&limit=1"
    endpoint += "&order=desc"
  end
  
  def get_transactions
    endpoint = set_transactions_endpoint()
    url = STELLAR_API + endpoint

    body = get_data_from_api(url)

    # Set links for previous and next buttons
    url = body['_links']['next']
    set_cursor(url, 'next', nil)

    url = body['_links']['prev']
    set_cursor(url, 'prev', nil)
    
    body['_embedded']['records'].present? ? body['_embedded']['records'] : []
  end

  def index
    # # Reset previous and next button links of transactions page,
    # # when user visits home page
    session[:next_cursor] = nil
    session[:prev_cursor] = nil    
  end

  def get_lumen_price_in_usd
    endpoint = "/ticker/stellar"
    url = COINMARKETCAP_API + endpoint
    lumen_data = get_data_from_api(url)
    lumen_data[0]["price_usd"].to_f
  end

  def calculate_usd_price(record, lumen_usd_price)
    if record
      counter_price = record["counter_amount"].to_f
      base_price = record["base_amount"].to_f

      price = (counter_price/base_price)*lumen_usd_price
      price.round(2)
    else
      UNDETERMINED_PRICE
    end
  end
  
  def set_usd_price(balances)
    # Formula: (counter_price / base_price ) * lumen_usd_price
    lumen_usd_price = get_lumen_price_in_usd()
    
    balances.each do |balance|
      if balance["asset_type"] == NATIVE_ASSET        
        balance["usd_price"] = lumen_usd_price.round(2)
      else
        endpoint = set_trades_endpoint(balance)
        url = STELLAR_API + endpoint
        trade = get_data_from_api(url)
        record = trade["_embedded"]["records"].first

        balance["usd_price"] = calculate_usd_price(record, lumen_usd_price)
      end
    end
  end

  def inactive_account
  end

  def transactions    
    @transactions = get_transactions()

    return @transactions.reverse if params[:order] == 'asc_order'

    respond_to do |format|
      format.html { @transactions }
      format.json { render json: body['_embedded']['records']}
    end
  end

  def get_assets
    endpoint = set_assets_endpoint()
    url = STELLAR_API + endpoint

    body = get_data_from_api(url)
    
    # Set links for previous and next buttons
    url = body['_links']['next']
    set_cursor(url, 'next', 'asset')

    url = body['_links']['prev']
    set_cursor(url, 'prev', 'asset')
    
    body['_embedded']['records'].present? ? body['_embedded']['records'] : []
  end

  def browse_assets
    @assets = get_assets()

    return @assets.reverse if params[:order] == 'asc_order'

    return @assets
  end
  
  def trust_asset
  end

  def transfer_assets
    # TODO refresh assets and balances without visiting home page
    @balances = session[:balances]

    @assets = @balances.map{
      |balance|
      balance["asset_type"] == NATIVE_ASSET ?
        "Lumens" :
        "#{balance['asset_code']}, #{balance['asset_issuer']}"
    }
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

  def activate_account
    if (session[:balances] == 404) || (session[:balances].blank?)
      redirect_to inactive_account_path
      return
    end
  end
end
