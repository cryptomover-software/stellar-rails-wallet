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

class PagesControllerTest < ActionDispatch::IntegrationTest
  # test "the truth" do
  #   assert true
  # end
  test 'agreement_modal' do
    @agreement_message = 'I hereby confirm that I am not U.S. and/or Hong Kong citizen/permanent resident representing U.S and/or Hong Kong citizen/permanent residents.'
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
    get login_path, params: { public_key: KEY1 }
    assert_select '#agreement-modal', count: 0
  end
end
