require 'test_helper'

class FederationMailerTest < ActionMailer::TestCase
  # test "the truth" do
  #   assert true
  # end
  test 'verification_email' do
    email = FederationMailer.with(federation: 'fanbing@cryptomover.com', token: 'zyxw').confirm_email
    assert_emails 1 do
      email.deliver_now
    end
  end
end
