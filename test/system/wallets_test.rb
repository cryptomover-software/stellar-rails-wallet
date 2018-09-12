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

require "application_system_test_case"


KEY1 = 'GDZP53LPGV4LGIZVTIPDIYL2N6VC6YYUBSJE66AZTNC77F6K2CN3K4OO'
KEY2 = 'GATEULHQJHKOF5VJNIDA2E4EDSLUEMPK4BVLKPLMMLJ57JGTII7VU4ZG'

class WalletsTest < ApplicationSystemTestCase
  # test "visiting the index" do
  #   visit wallets_url
  #
  #   assert_selector "h1", text: "Wallets"
  # end

  test 'display_federation_address_if_created_in_our_app' do
    @federation_address = 'abhijit@cryptomover.com*cryptomover.com'
    visit root_path
    click_on '#agree-btn'
    fill_in 'public-key', with: KEY1
    click_button 'Login'
    assert_selector '#federation', text: @federation_address
    sleep 10
    visit trust_asset_path
    assert_selector '#federation', text: @federation_address
    visit send_money_path
    assert_selector '#federation', text: @federation_address
  end

  test 'resolve_federation_address_to_stellar_key' do
    @federation_address = 'abhijit@cryptomover.com*cryptomover.com'
    visit root_path
    click_on '#agree-btn'
    visit simulate_login_for_testing_path
    visit send_money_path
    fill_in 'target-account', with: @federation_address
    sleep 3
    click_on 'send-max'
    sleep 2
    assert_selector '#resolve-fed-address', text: KEY1
  end

  test 'show_confirm_email_warning_if_not_confirmed' do
    visit root_path
    click_on '#agree-btn'
    fill_in 'public-key', with: KEY2
    click_on 'Login'
    sleep 10
    assert_selector '#verify-warning'
  end
end
