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
end
