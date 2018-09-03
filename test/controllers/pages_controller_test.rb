require 'test_helper'

class PagesControllerTest < ActionDispatch::IntegrationTest
  # test "the truth" do
  #   assert true
  # end
  test 'agreemen_modal' do
    @agreement_message = 'I hereby confirm that I am not U.S. citizen/permanent resident representing U.S citizen/permanent residents.'
    get root_path
    # Modal should be present in first visit
    assert_select '#agreement-modal' do |elements|
      elements.each do |element|
        assert_select element, '.modal-body' do |es|
          es.each do |e|
            assert_select e, 'p', @agreement_message
          end
        end
      end
    end
  end
end
