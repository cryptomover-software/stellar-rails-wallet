require 'test_helper'

class PagesControllerTest < ActionDispatch::IntegrationTest
  # test "the truth" do
  #   assert true
  # end
  test 'verify_captcha' do
  end

  test 'verify_valid_stellar_public_key' do
    sample_key = 'GDZP53LPGV4LGIZVTIPDIYL2N6VC6YYUBSJE66AZTNC77F6K2CN3K4OO'
    assert_nothing_raised do
      Stellar::KeyPair.from_address(sample_key)
    end
  end
end
