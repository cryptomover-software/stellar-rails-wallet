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
require 'test_helper'

class FederationsControllerTest < ActionDispatch::IntegrationTest
  # test "the truth" do
  #   assert true
  # end
  test "duplicate_federation_address_on_create" do
    @username = 'abhijit@cryptomover.com'
    get login_path, params: {public_key:
                               'GDZP53LPGV4LGIZVTIPDIYL2N6VC6YYUBSJE66AZTNC77F6K2CN3K4OO'}

    assert_raises(ActiveRecord::RecordInvalid) {
      # it should not create a new record,
      # because a record with same username already exists.
      post federations_path, params: { federation:
                                         { username: @username}, format: 'js' }, xhr: true
    }
  end

  # ToDo
  # test "send_verification_email_on_federation_address_on_create" do
  #   @username = 'test_federation'
  #   get login_path, params: {public_key:
  #                              ''}

  #   post federations_path, params: { federation:
  #                                      { username: @username}, format: 'js' }, xhr: true
  #   assert_equal @username, @response.body
  # end

  test "confirm_email_with_valid_token" do
    get login_path, params: {public_key:
                               'GATEULHQJHKOF5VJNIDA2E4EDSLUEMPK4BVLKPLMMLJ57JGTII7VU4ZG'}
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
