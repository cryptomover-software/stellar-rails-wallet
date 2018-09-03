# frozen_string_literal: true
require "application_system_test_case"

KEY1 = 'GDZP53LPGV4LGIZVTIPDIYL2N6VC6YYUBSJE66AZTNC77F6K2CN3K4OO'

class WalletsTest < ApplicationSystemTestCase
  # test "visiting the index" do
  #   visit wallets_url
  #
  #   assert_selector "h1", text: "Wallets"
  # end
  test 'display_federation_address_if_created_in_our_app' do
    @federation_address = 'abhijit@cryptomover.com*cryptomover.com'
    visit login_path #, params: {public_key: }
    click_on '#agree-btn'
    fill_in 'public-key', with: KEY1
    click_button 'Login'
    assert_selector '#portfolio-card'
    assert_selector '#federation', text: @federation_address
    sleep 10
    visit trust_asset_path
    assert_selector '#federation', text: @federation_address
    visit send_money_path
    assert_selector '#federation', text: @federation_address
  end
end
