class WalletsController < ApplicationController
  # TODO: add verifiction of user copied private key
  # before leaving new account page
  before_action :user_must_login, except: [:login, :logout,
                                           :new_account, :trezor_wallet]
  before_action :activate_account, except: [:index, :get_balances,
                                            :login, :logout,
                                            :new_account, :inactive_account,
                                            :success, :failed,
                                            :trezor_wallet, :federation_account]
  # excluding index action too because,
  # for Index action, we check account status each time
  # after fetching balance data from Stellar API
  # and after initializing the balance cookie.
  before_action :validate_trezor_login, only: :trezor_wallet

  # APIs
  STELLAR_API = 'https://horizon.stellar.org'.freeze
  COINMARKETCAP_API = 'https://api.coinmarketcap.com/v1'.freeze
  # Configuration values
  STELLAR_MIN_BALANCE = 1
  STELLAR_TRANSACTION_FEE = 0.00001
  BASE_RESERVE = 0.5
  NATIVE_ASSET = 'native'.freeze
  STELLAR_ASSET = 'XLM'.freeze
  CRYPTOMOVER_DOMAIN = 'cryptomover.com'.freeze
  TREZOR_LOGIN_KEY = 'cryptomover'.freeze
  TREZOR_LOGIN_CYPHER_VALUE = 'fb00d59cd37c56d64ce6eba73af7a0aacdd25e06d18f98af16fc4a7b341b7136'.freeze
  FETCHING_BALANCES = 'fetching'.freeze
  # Login Errors
  INVALID_LOGIN_KEY = 'Invalid Login Key. Please check key again.'.freeze
  INVALID_CAPTCHA = 'Please Verify CAPTCHA Code.'.freeze
  INVALID_TREZOR_KEY = 'Trezor Key must be cryptomover. Do not change key.'.freeze
  INVALID_TREZOR_CYPHER = 'Invalid Cypher Value. Do not change cypher value.'.freeze
  TREZOR_LOGIN_ERROR = 'Something went wrong. Please try again.'.freeze
  # Other Errors
  INVALID_FEDERATION_ADDRESS = 'Invalid Federation Address OR Address Does not Exists.'
  UNDETERMINED_PRICE = 'undetermined'.freeze
  HTTPARTY_STANDARD_ERROR = 'Unable to reach Stellar Server. Check network connection or try again later.'.freeze
  HTTPARTY_500_ERROR = 'Sowething Wrong with your Account. Please check with Stellar or contact Cryptomover support.'.freeze
  ACCOUNT_ERROR = 'account_error'.freeze

  def index
    session[:balances] = FETCHING_BALANCES
    # Reset previous and next button links of transactions page,
    # when user visits home page
    session[:next_cursor] = nil
    session[:prev_cursor] = nil

    @federation = set_federation_address
  end

  def get_federation_server_address(address)
    domain = address.split('*')[1]
    url = "https://#{domain}/.well-known/stellar.toml"
    result = HTTParty.get(url)
    # Note and TODO:
    # We are using file parsing solution instead of using TOML
    # library for the time being. This is because there are some
    # technical errors with TOML library and it will take time to fix it.
    # In future we need to use TOML library to parse TOML input.
    toml = Hash[*result.split(/=|\n/)]
    url = toml["FEDERATION_SERVER"]
    # Remove unwanted backward \ from url
    # TODO: Make sure this works with all TOML outputs
    url.delete('\"')
  end

  def get_address_locally(username)
    federation = Federation.where(username: username).first
    return INVALID_FEDERATION_ADDRESS unless federation

    federation.address
  end

  def fetch_address_from_federation(address)
    username = address.split('*')[0]
    domain_name = address.split('*')[1]
    # All accounts created on our wallet are stored locally
    # with domain name cryptomover.com.
    # They will be synced with our Stellar Federation server.
    return get_address_locally(username) if domain_name == CRYPTOMOVER_DOMAIN

    server_url = get_federation_server_address(address)
    url = "#{server_url}?q=#{username}*#{domain_name}&type=name"
    # TODO: Handle errors & when username do not exist on server
    result = HTTParty.get(url)
    result['account_id']
  end

  def get_federation_address
    address = params[:address]
    account_id = fetch_address_from_federation(address)

    respond_to do |format|
      format.js { render json: account_id }
    end
  end

  def login
    session.clear
    begin
      flash[:notice] = INVALID_CAPTCHA
      redirect_to root_path && return unless verify_recaptcha

      flash.clear
      address = params[:public_key].delete(' ')

      if address.include? '*'
        session[:federation_address] = address
        address = fetch_address_from_federation(address)
      end

      # Failure to generate key pair indicates invalid Public Key.
      Stellar::KeyPair.from_address(address)

      session[:address] = address
      logger.debug "--> User #{session[:address]} Logged In at #{Time.now}."
      redirect_to portfolio_path
    rescue
      flash[:notice] = INVALID_LOGIN_KEY
      logger.debug "--> ERROR! Invalid Key #{params[:public_key]}"
      redirect_to root_path
    end
  end

  def trezor_wallet
    session.clear
    begin
      value = params[:value]
      seed = value.scan(/../).collect { |c| c.to_i(16).chr }.join
      pair = Stellar::KeyPair.from_raw_seed(seed)

      session[:address] = pair.address
      session[:seed] = pair.seed
      logger.debug "--> SUCCESS! Trezor Login with address #{session[:address]}"
      redirect_to portfolio_path
    rescue
      flash[:notice] = TREZOR_LOGIN_ERROR
      logger.debug "--> ERROR! Trezor Loging Failed. Value: #{params[:value]}"
      redirect_to trezor_wallet_login_path
    end
  end

  def logout
    logger.debug "--> User #{session[:address]} Logged Out at #{Time.now}."
    session.clear
    redirect_to root_path
  end

  def account
    @address = session[:address]
    @seed = session[:seed]
  end

  def new_account
    session.clear

    random = Stellar::KeyPair.random
    session[:address] = @address = random.address
    logger.debug "--> SUCCESS! New Account created with address #{session[:address]}"
    @seed = random.seed
  end

  def get_data_from_api(url)
    response = HTTParty.get(url)

    case response.code
      # when 200
    when 404
      logger.debug '--> 404 Error while fetching data from API'
      return 404
    when 500...600
      logger.debug '--> 500...600 Error while fetching data from API'
      return ACCOUNT_ERROR
    end

    JSON.parse(response.body)
  end

  def get_balance
    # Return Balance of Singe Asset
    asset_code = params[:code]
    balances = session[:balances]

    if asset_code == STELLAR_ASSET
      asset_code = NATIVE_ASSET
      asset_balance = balances.select { |key| key['asset_type'] == asset_code }
      balance = asset_balance.first['balance']
    else
      asset_balance = balances.select { |key| key['asset_code'] == asset_code }
      balance = asset_balance.first['balance']
    end

    max_allowed_amount = calculate_max_allowed_amount(asset_code)
    result = [balance.to_f, max_allowed_amount]

    respond_to do |format|
      format.json {render json: result}
    end
  end
  
  def get_balances
    address = session[:address]
    endpoint = "/accounts/#{address}"
    url = STELLAR_API + endpoint
    session[:balances] = balances = FETCHING_BALANCES

    begin
      balances = get_data_from_api(url)

      balances = set_usd_price(balances['balances']) if (balances != 404) && (balances != ACCOUNT_ERROR)
      session[:balances] = balances if balances != ACCOUNT_ERROR

      respond_to do |format|
        format.json {render json: balances}
      end
    rescue StandardError # => e
      # puts e
      logger.debug '--> FAILED! Fetching balances failed.'
      render js: "document.location.href='/failed?error_description=#{HTTPARTY_STANDARD_ERROR}'"
      # render html: failed_path(error_description: HTTPARTY_STANDARD_ERROR)
    end
  end

  def set_cursor(url)
    # Setting Pagination Cursor for
    # Previous and Next actions

    cursor_url = url['href']
    url_params = CGI.parse(URI.parse(cursor_url).query)

    url_params['cursor']
  end

  def set_assets_endpoint
    endpoint = '/assets?limit=20'
    
    # endpoint += "&cursor=#{params[:cursor]}" if (params[:cursor])

    # endpoint += "&asset_code=#{params[:asset_code]}" if params[:asset_code]
    # endpoint += "&asset_issuer=#{params[:asset_issuer]}" if params[:asset_issuer]
    
    # order = if params[:order] == 'asc'
    #               '&order=asc'
    #             elsif params[:order] == 'desc'
    #               '&order=desc'
    #         end
    # endpoint # + order
  end

  def set_trades_endpoint(balance)
    endpoint = '/trades?'
    endpoint += 'base_asset_type=' + balance['asset_type']
    endpoint += '&base_asset_code=' + balance['asset_code']
    endpoint += '&base_asset_issuer=' + balance['asset_issuer']
    endpoint += "&counter_asset_type=#{NATIVE_ASSET}"
    endpoint += '&limit=1'
    endpoint += '&order=desc'
    endpoint
  end

  def set_federation_address
    return session[:federation_address] if session[:federation_address].present?
    f = Federation.where(address: session[:address]).first
    if f.present?
      address = "#{f.username}*cryptomover.com"
      session[:federation_address] = address
      return address
    end
  end

  def get_lumen_price_in_usd
    endpoint = '/ticker/stellar'
    url = COINMARKETCAP_API + endpoint
    lumen_data = get_data_from_api(url)
    lumen_data[0]['price_usd'].to_f
  end

  def calculate_usd_price(record, lumen_usd_price, balance)
    if record
      counter_price = record['counter_amount'].to_f
      base_price = record['base_amount'].to_f
      asset_price_in_lumen = counter_price/base_price
      quantity = balance['balance'].to_f

      price = (asset_price_in_lumen * lumen_usd_price) * (quantity)
      price.round(2)
    else
      UNDETERMINED_PRICE
    end
  end
  

  def set_usd_price(balances)
    # Formula: (counter_price / base_price ) * lumen_usd_price
    lumen_usd_price = get_lumen_price_in_usd()
    
    balances.each do |balance|
      if balance['asset_type'] == NATIVE_ASSET
        quantity = balance['balance'].to_f
        usd_price = lumen_usd_price * quantity
        
        balance['usd_price'] = usd_price.round(2)
      else
        endpoint = set_trades_endpoint(balance)
        url = STELLAR_API + endpoint
        trade = get_data_from_api(url)
        record = trade['_embedded']['records'].first

        balance['usd_price'] = calculate_usd_price(record, lumen_usd_price, balance)
      end
    end
  end

  def inactive_account
    logger.debug "--> Account #{session[:address]} is Inactive."
  end

  def set_transactions_endpoint
    endpoint = "/accounts/#{session[:address]}/payments?limit=3"

    endpoint += "&cursor=#{params[:cursor]}" if params[:cursor]

    order = if params[:order] == 'asc'
              '&order=asc'
            else
              '&order=desc'
            end
    endpoint + order
  end

  def get_transactions
    endpoint = set_transactions_endpoint()
    url = STELLAR_API + endpoint

    body = get_data_from_api(url)

    # Set links for previous and next buttons
    url = body['_links']['next']
    next_cursor = set_cursor(url)

    url = body['_links']['prev']
    prev_cursor = set_cursor(url)

    transactions = body['_embedded']['records'].present? ? body['_embedded']['records'] : []
    [transactions, next_cursor, prev_cursor]
  end

  def transactions
    begin
      result = get_transactions()
      @transactions = result[0]
      @transactions = @transactions.reverse if params[:order] == 'asc_order'
      @next_cursor = result[1]
      @prev_cursor = result[2]
    rescue StandardError => e
      puts "------------"
      puts e
      logger.debug '--> FAILED! Fetching transactions history failed.'
      redirect_to failed_path(error_description: e)
    end
  end

  def get_assets
    endpoint = set_assets_endpoint()
    url = STELLAR_API + endpoint

    body = get_data_from_api(url)
    
    # Set links for previous and next buttons
    # next_cursor = body['_links']['next']
    # prev_cursor = body['_links']['prev']
    # set_cursor(next_cursor, prev_cursor, 'asset')
    
    body['_embedded']['records'].present? ? body['_embedded']['records'] : []
  end

  def browse_assets
    begin
      @assets = get_assets()
      return @assets
    rescue StandardError # => e
      # puts e
      logger.debug '--> FAILED! Fetchin list of assets failed.'
      redirect_to failed_path(error_description: HTTPARTY_STANDARD_ERROR)
    end
  end
  
  def trust_asset
    balances = session[:balances]
    balance = balances.select{|b| b['asset_type'] == NATIVE_ASSET}
    @lumens_balance = balance.first['balance']
  end

  def calculate_max_allowed_amount(asset_type)
    balances = session[:balances]

    trusted_assets = balances.select{|b| b['asset_code']}
    
    lumens_record = balances.select{ |b| b['asset_type'] == NATIVE_ASSET}
    lumen_balance = lumens_record.first['balance'].to_f

    minimum_reserve_balance = STELLAR_MIN_BALANCE + (BASE_RESERVE * trusted_assets.count)
    min_balance_required = STELLAR_TRANSACTION_FEE + minimum_reserve_balance

    if asset_type == NATIVE_ASSET
      allowed_amount = lumen_balance - min_balance_required
      allowed_amount > 0 ? allowed_amount.round(5) : 'Not Enough Balance'
    elsif (lumen_balance > min_balance_required)
      assets_record = balances.select{|b| b['asset_code'] == asset_type}
      asset_balance = assets_record.first['balance'].to_f
      asset_balance > 0 ? asset_balance : 'Not Enough Balance'
    else
      'Not Enough Balance'
    end
  end

  def transfer_assets
    @federation = session[:federation_address]
    @balances = session[:balances]
    
    @max_allowed_amount = calculate_max_allowed_amount(NATIVE_ASSET)

    @assets = @balances.map {
      |balance|
      balance['asset_type'] == NATIVE_ASSET ?
        'Lumens' : "#{balance['asset_code']}, #{balance['asset_issuer']}"
    }
  end

  def success
  end

  def failed
  end

  def federation_account
    @address = session[:address]
    @federations = Federation.where(address: @address)
  end

  private
  def activate_account
    if (session[:balances] == FETCHING_BALANCES)
      # We are still fetching balances data from Stellar API.
      # Request user to wait until that operation is completed.
      logger.debug '--> User attempted page access before fetching balances.'
      redirect_to fetching_balances_path
      return
    elsif (session[:balances] == 404) || (session[:balances].blank?)
      # Either this is new inactive account yet to be funded,
      # or something went wrong while creating balances cookies.
      logger.debug '--> Inactive account or Error in fetching Balance.'
      redirect_to inactive_account_path
      return
    end
  end

  def validate_trezor_login
    key = params[:key]
    cypher_value = params[:cypher_value]

    flash[:notice] = INVALID_TREZOR_KEY
    redirect_to trezor_wallet_login_path && return if key != TREZOR_LOGIN_KEY
    flash.clear
    flash[:notice] = INVALID_TREZOR_CYPHER
    redirect_to trezor_wallet_login_path && return if cypher_value != TREZOR_LOGIN_CYPHER_VALUE
  end
end
