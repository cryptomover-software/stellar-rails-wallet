require 'test_helper'

class FederationsControllerTest < ActionDispatch::IntegrationTest
  # test "the truth" do
  #   assert true
  # end
  test "duplicate_federation_address_on_create" do
    @username = 'abhijit@cryptomover.com'
    get login_path, params: {public_key:
                               'GDZP53LPGV4LGIZVTIPDIYL2N6VC6YYUBSJE66AZTNC77F6K2CN3K4OO'}

    post federations_path, params: { federation:
                                       { username: @username}, format: 'js' }, xhr: true
    # it should not create a new record,
    # because a record with same username already exists.
    assert_not_equal @username, @response.body
  end

  # ToDo
  # test "send_verification_email_on_federation_address_on_create" do
  #   @username = 'test_federation'
  #   get login_path, params: {public_key:
  #                              'GDWU47CWKN3OARGCFZGVE3JQ3FOCRV4GDLUSUXYKSUKG74OXWHGNGDJV'}

  #   post federations_path, params: { federation:
  #                                      { username: @username}, format: 'js' }, xhr: true
  #   assert_equal @username, @response.body
  # end

  test "confirm_email_with_valid_token" do
    @token = 'zyxw'
    get confirm_email_path, params: {token: @token}
    @federation = Federation.where(email_confirmation_token: @token).first

    assert @federation.email_confirmed
  end

  test "do_not_confirm_existing_email" do
    @token = 'abcd'
    get confirm_email_path, params: {token: @token}
    @federation = Federation.where(email_confirmation_token: @token).first

    assert_redirected_to root_path
  end

  test "resend_verification_email" do
    @message = 'Verification email sent to fanbing@cryptomover.com'
    get login_path, params: {public_key:
                               'GATEULHQJHKOF5VJNIDA2E4EDSLUEMPK4BVLKPLMMLJ57JGTII7VU4ZG'}
    get resend_confirmation_email_path, xhr: true
    assert_equal @message, @response.body
  end

  test "resend_verification_email_within_limit" do
    @message = 'ERROR! Maximum Emails sent. Contant support.'
    get login_path, params: {public_key:
                               'GDZP53LPGV4LGIZVTIPDIYL2N6VC6YYUBSJE66AZTNC77F6K2CN3K4OO'}
    get resend_confirmation_email_path, xhr: true
    assert_equal @message, @response.body
  end
end
