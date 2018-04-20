require 'test_helper'

class WalletsControllerTest < ActionDispatch::IntegrationTest
  # test "the truth" do
  #   assert true
  # end
  test 'login_success_redirection' do
    get '/login', params: {public_key: 'GDZP53LPGV4LGIZVTIPDIYL2N6VC6YYUBSJE66AZTNC77F6K2CN3K4OO'}
    assert_redirected_to(controller: 'wallets', action: 'index')
  end

  test 'login_failure_redirection' do
    get '/login', params: {public_key: 'GDZP53LPGV4LGIZVTIPDIYL2N6VC6YYUBSJE66AZTNC77F6K2CN3K'}
    assert_redirected_to(controller: 'pages', action: 'index')
  end

  test 'valid_stellar_public_key_logic' do
    sample_key = 'GDZP53LPGV4LGIZVTIPDIYL2N6VC6YYUBSJE66AZTNC77F6K2CN3K4OO'
    assert_nothing_raised do
      Stellar::KeyPair.from_address(sample_key)
    end
  end

  test 'still_fetching_balances_redirection' do
    get '/login', params: {public_key: 'GDZP53LPGV4LGIZVTIPDIYL2N6VC6YYUBSJE66AZTNC77F6K2CN3K4OO'}
    get '/portfolio'
    get '/send_money'
    assert_redirected_to(controller: 'pages', action: 'fetching_balances')
  end
end
