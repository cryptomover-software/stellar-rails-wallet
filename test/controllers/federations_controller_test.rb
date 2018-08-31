require 'test_helper'

class FederationsControllerTest < ActionDispatch::IntegrationTest
  # test "the truth" do
  #   assert true
  # end
  test "duplicate_federation_address_creation" do
    @username = 'abhijit@cryptomover.com'
    get login_path, params: {public_key:
                               'GDZP53LPGV4LGIZVTIPDIYL2N6VC6YYUBSJE66AZTNC77F6K2CN3K4OO'}

    post federations_path, params: { federation:
                                       { username: @username}, format: 'js' }, xhr: true
    # it should not create a new record,
    # because a record with same username already exists.
    assert_not_equal @username, @response.body
  end

  test "send_verification_email_on_federation_address_creation" do
  end
end
