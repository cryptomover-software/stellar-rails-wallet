require 'test_helper'

class WalletsControllerTest < ActionDispatch::IntegrationTest
  # test "the truth" do
  #   assert true
  # end
  test 'login_redirection' do
    puts '--> Caling Login action'
    get '/login', params: {public_key: 'GDZP53LPGV4LGIZVTIPDIYL2N6VC6YYUBSJE66AZTNC77F6K2CN3K4OO'}
    assert_redirected_to(controller: 'wallets', action: 'index')
  end
end
