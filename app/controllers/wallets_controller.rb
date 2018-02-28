class WalletsController < ApplicationController
  before_action :user_must_login, except: [:login, :new_account]
  before_action :activate_account, except: [:index, :login, :logout, :new_account, :forgot_password, :inactive_account]
  # for Index action, we check account status each time
  # after fetching balance and after initializing the balance cookie.
  
  STELLAR_API = "https://horizon.stellar.org".freeze
  NATIVE_ASSET = "native".freeze
  INVALID_LOGIN_KEY = "Invalid Public Key. Please check key again.".freeze
  
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
    # Setting Pagination Cursor for
    # Previous and Next actions
    url = url['href']
    
    url_params = CGI::parse(URI::parse(url).query)

    if cookie == 'next'
      session[:next_cursor] = url_params['cursor']
    else
      session[:prev_cursor] = url_params['cursor']
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
  
  def get_transactions
    endpoint = set_transactions_endpoint()

    body = get_data_from_stellar_api(endpoint)

    # Set links for previous and next buttons
    url = body['_links']['next']
    set_cursor(url, 'next')

    url = body['_links']['prev']
    set_cursor(url, 'prev')
    
    body['_embedded']['records'].present? ? body['_embedded']['records'] : []
  end

  def index
    @balances = get_balances()
    
    session[:balances] = @balances

    # Reset previous and next button links of transactions page,
    # when user visits home page
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
    @transactions = get_transactions()

    return @transactions.reverse if params[:order] == 'asc_order'

    respond_to do |format|
      format.html { @transactions }
      format.json { render json: body['_embedded']['records']}
    end
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

  def activate_account
    if session[:balances] == 404
      redirect_to inactive_account_path
      return
    end
  end
end
