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

KEY1 = 'GDZP53LPGV4LGIZVTIPDIYL2N6VC6YYUBSJE66AZTNC77F6K2CN3K4OO'

class WalletsControllerTest < ActionDispatch::IntegrationTest
  # test "the truth" do
  #   assert true
  # end
  test 'login_success_redirection' do
    get login_path, params: {public_key: KEY1}
    assert_redirected_to(portfolio_path)
  end

  test 'login_failure_redirection' do
    get login_path, params: {public_key: KEY1.chomp('4OO')}
    assert_redirected_to(root_path)
  end

  test 'logout_success_redirection' do
    get login_path, params: {public_key: KEY1}
    get logout_path
    assert_redirected_to(root_path)
  end

  test 'valid_stellar_public_key_logic' do
    sample_key = KEY1
    assert_nothing_raised do
      Stellar::KeyPair.from_address(sample_key)
    end
  end

  test 'still_fetching_balances_redirection' do
    get login_path, params: {public_key: KEY1}
    get portfolio_path
    get send_money_path
    assert_redirected_to(fetching_balances_path)
  end

  test 'new_account_rendered' do
    get new_account_path
    assert_template :new_account
  end
end
