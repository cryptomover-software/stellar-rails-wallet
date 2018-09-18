# frozen_string_literal: true

# LICENSE
#
# MIT License
#
# Copyright (c) 2017-2018 Cryptomover
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights to
# use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
# of the Software, and to permit persons to whom the Software is furnished to do
# so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.

class WalletsController < ApplicationController
  # TODO: add verifiction of user copied private key
  # before leaving new account page
  before_action :user_must_login, except: [:login, :logout,
                                           :new_account, :failed,
                                           :simulate_login_for_testing]
  before_action :activate_account, except: [:index, :get_balances,
                                            :login, :logout,
                                            :new_account, :inactive_account,
                                            :success, :failed,
                                            :federation_account,
                                            :simulate_login_for_testing]
  # excluding index action too because,
  # for Index action, we check account status each time
  # after fetching balance data from Stellar API
  # and after initializing the balance cookie.

  # APIs
  STELLAR_API = 'https://horizon.stellar.org'
  COINMARKETCAP_API = 'https://api.coinmarketcap.com/v1'
  # Configuration values
  STELLAR_MIN_BALANCE = 1
  STELLAR_TRANSACTION_FEE = 0.00001
  BASE_RESERVE = 0.5
  NATIVE_ASSET = 'native'
  STELLAR_ASSET = 'XLM'
  CRYPTOMOVER_DOMAIN = 'cryptomover.com'
  FETCHING_BALANCES = 'fetching'
  # Login Errors
  INVALID_LOGIN_KEY = 'Invalid or Empty Login Key. Please check key again.'
  INVALID_CAPTCHA = 'Please Verify CAPTCHA Code.'
  # Other Errors
  INVALID_FEDERATION_ADDRESS = 'Invalid Federation Address OR Address Does not Exists.'
  FEDERATION_ADDRESS_NOT_FOUND = 'Federation address not registered with us.'
  UNDETERMINED_PRICE = 'undetermined'
  HTTPARTY_STANDARD_ERROR = 'Unable to reach Server. Check URL and network connection or try again later.'
  ACCOUNT_ERROR = 'Sowething Wrong with your Account. Please check with Stellar or contact Cryptomover support.'

  def index
    session[:balances] = FETCHING_BALANCES
    # Reset previous and next button links of transactions page,
    # when user visits home page
    session[:next_cursor] = nil
    session[:prev_cursor] = nil

    @federation = session[:federation_address]
    @email_confirmed = session[:email_confirmed]
  end

  def get_federation_server_address(address)
    # Process address fetching request
    # for non cryptomover federation servers.
    domain = address.split('*')[1]
    url = "https://#{domain}/.well-known/stellar.toml"

    begin
      # Note and TODO:
      # We are using file parsing solution instead of using TOML
      # library for the time being. This is because there are some
      # technical errors with TOML library and it will take time to fix it.
      # In future we need to use TOML library to parse TOML input.
      response = HTTParty.get(url)
      toml = Hash[*response.split(/=|\n/)]
      url = toml['FEDERATION_SERVER']
      url.delete('\"')
    rescue HTTParty::Error, SocketError => e
      puts e
      logger.debug '--> Error while fetching data from API'
      return HTTPARTY_STANDARD_ERROR
    end
  end

  def get_federation_locally(username)
    federation = Federation.where(username: username).first
    return FEDERATION_ADDRESS_NOT_FOUND unless federation
    session[:email_confirmed] = federation.email_confirmed

    federation.address
  end

  def fetch_address_from_federation(address)
    username = address.split('*')[0]
    domain_name = address.split('*')[1]
    # All accounts created on our wallet are stored locally
    # with domain name cryptomover.com.
    # They will be synced with our Stellar Federation server.
    return get_federation_locally(username) if domain_name == CRYPTOMOVER_DOMAIN


    server_url = get_federation_server_address(address)
    return server_url if server_url == HTTPARTY_STANDARD_ERROR
    
    url = "#{server_url}?q=#{username}*#{domain_name}&type=name"
    # TODO: Handle errors & when username do not exist on server
    begin
      response = HTTParty.get(url)
      response['account_id']
    rescue HTTParty::Error, SocketError => e
      puts e
      logger.debug '--> Error while fetching data from API'
      return HTTPARTY_STANDARD_ERROR
    end
  end

  def get_federation_address
    # retrieve federation address associated with the Stellar key,
    # when user enters that key on transfer asset form
    address = params[:address]
    account_id = fetch_address_from_federation(address)

    respond_to do |format|
      format.js { render json: account_id }
    end
  end

  def set_session_addresses(address)
    if address.include? '*'
      session[:federation_address] = address.split('*')[0]
      session[:address] = fetch_address_from_federation(address)
    else
      session[:address] = address
      if Federation.exists?(address: address)
        f = Federation.where(address: address).first
        session[:federation_address] = f.username
        session[:email_confirmed] = f.email_confirmed
      end
    end
  end

  def login
    session.clear
    flash.clear
    address = params[:public_key].delete(' ')

    if address.empty?
      flash[:notice] = INVALID_LOGIN_KEY
      redirect_to root_path
      return
    end

    unless verify_recaptcha
      flash[:notice] = INVALID_CAPTCHA
      redirect_to root_path
      return
    end

    set_session_addresses(address)
    # Failure to generate key pair indicates invalid Public Key.
    if session[:address] == FEDERATION_ADDRESS_NOT_FOUND
      message = FEDERATION_ADDRESS_NOT_FOUND
    else
      message = INVALID_LOGIN_KEY
    end

    begin
      Stellar::KeyPair.from_address(session[:address])
    rescue
      session.clear

      flash[:notice] = message
      logger.debug "--> ERROR! Invalid Key #{params[:public_key]}"
      redirect_to root_path
      return
    end

    logger.debug "--> User #{session[:address]} Logged In at #{Time.now}."
    redirect_to portfolio_path
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
    @federation = Federation.where(address: session[:address]).first
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
    else
      asset_balance = balances.select { |key| key['asset_code'] == asset_code }
    end
    balance = asset_balance.first['balance']

    max_allowed_amount = calculate_max_allowed_amount(asset_code)
    result = [balance.to_f, max_allowed_amount]

    respond_to do |format|
      format.json { render json: result }
    end
  end

  def get_usd_prices
    balances = set_usd_price(session[:balances])
    respond_to do |format|
      format.json { render json: balances }
    end
  end
  
  def get_balances
    address = session[:address]
    endpoint = "/accounts/#{address}"
    url = STELLAR_API + endpoint
    session[:balances] = balances = FETCHING_BALANCES

    begin
      result = get_data_from_api(url)

      if (result != 404) && (result != ACCOUNT_ERROR)
        balances = result['balances']
        session[:balances] = balances # if balances != ACCOUNT_ERROR
      end

      respond_to do |format|
        format.json { render json: balances }
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
        # Fetch latest trade against the pair XLM-Asset.
        # Thin using this trade's price and USD price of XLM
        # calculate USD price of this Asset
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
    endpoint = '/assets?limit=30'
    url = STELLAR_API + endpoint
    body = get_data_from_api(url)

    assets = body['_embedded']['records'].present? ? body['_embedded']['records'] : []
    next_url = body['_links']['next']['href']
    [assets, next_url]
  end

  def fetch_next_assets
    url = params[:next_url]
    body = get_data_from_api(url)
    assets = body['_embedded']['records'].present? ? body['_embedded']['records'] : []
    next_url = body['_links']['next']['href']
    data = [assets, next_url]
    respond_to do |format|
      format.json { render json: data }
    end
  end

  def browse_assets
    begin
      result = get_assets
      @assets = result[0]
      @next_url = result[1]
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
    @federation = session[:federation_address]
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

  def simulate_login_for_testing
    session[:testing] = true
    session[:address] = 'GDZP53LPGV4LGIZVTIPDIYL2N6VC6YYUBSJE66AZTNC77F6K2CN3K4OO'
    session[:federation_address] = 'abhijit@cryptomover.com'
    session[:balances] = [{"balance"=>"1.0000000",
                          "limit"=>"1300.0000000",
                          "asset_type"=>"credit_alphanum4",
                          "asset_code"=>"HKDC",
                          "asset_issuer"=>"GA4BYMUO5D7OLGVJWZ2D5FCWU7SB63FNZ4QUU574SMNA6ELK5TZD3SO3",
                          "usd_price"=>0.0},
                          {"balance"=>"0.0000000",
                           "limit"=>"922337203685.4775807",
                           "asset_type"=>"credit_alphanum12",
                           "asset_code"=>"1043388008",
                           "asset_issuer"=>"GD5AEHBCLSEURJGA5X7QOF7U36XV4F5DHSV7B46OONJYQC4DRNBUG5UN",
                           "usd_price"=>"undetermined"},
                          {"balance"=>"6.8995200",
                           "asset_type"=>"native",
                           "usd_price"=>1.51}]
    render body: nil
  end

  # def federation_account
  #   @address = session[:address]
  #   @federations = Federation.where(address: @address)

  #   head :no_content
  # end

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
end
