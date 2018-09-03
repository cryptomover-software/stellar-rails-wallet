require 'test_helper'

class PagesControllerTest < ActionDispatch::IntegrationTest
  # test "the truth" do
  #   assert true
  # end
  test 'agreement_modal' do
    @agreement_message = 'I hereby confirm that I am not U.S. citizen/permanent resident representing U.S citizen/permanent residents.'
    get root_path
    # Agreement modal should be present in first visit
    assert_select '#agreement-modal' do |elements|
      elements.each do |element|
        assert_select element, '.modal-body' do |es|
          es.each do |e|
            assert_select e, 'p', @agreement_message
          end
        end
      end
    end
    # Agreement modal should not be present on all subsequent visits.
    get login_path, params: {public_key:
                               'GDZP53LPGV4LGIZVTIPDIYL2N6VC6YYUBSJE66AZTNC77F6K2CN3K4OO'}
    assert_select '#agreement-modal', count: 0
  end
end
