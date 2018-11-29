// LICENSE
//
// MIT License
//
// Copyright (c) 2017-2018 Cryptomover
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
// of the Software, and to permit persons to whom the Software is furnished to do
// so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {progressBar, appendDataToTable} from './helper';


class PortfolioTable extends React.Component {
    constructor (props) {
        super(props);
        this.state = {};
        
    }
    componentDidMount() {
        progressBar();
        var message = '';
        $.ajax({
            url: "/get_balances",
        }).done(function(balances) {
            if (balances == 404) {
                $.post('/create_log', {message: '--> ERROR! Inactive Account.'});
                document.location.href = "/inactive_account";
            } else if (balances == "account_error") {
                message = 'Something Wrong with your account. Please check with Stellar Support or Contact Cryptomover Support.';
                $.post('/create_log', {message: '--> ERROR! ' + message});
                document.location.href = '/failed?error_description=' + message;
            } else if (balances == undefined) {
                message = 'Unable to reach Stellar Server. Check Network Connection Or Try again later.';
                $.post('/create_log', {message: '--> ERROR! ' + message});
                document.location.href = '/failed?error_description=' + message;
            } else {
                $("#progressbar").hide();
                $('#create-federation-address-btn').removeAttr('disabled');
                $('#resend-confirmation-email-btn').removeAttr('disabled');
                appendDataToTable(balances);
                // second ajax start
                $.ajax({
                    url: "/get_usd_prices",
                }).done(function(balancesWithUsd) {
                    appendDataToTable(balancesWithUsd);
                });
                // second ajax end
            }
        });
    }
    render() {
        return (
            <div>
              <div className="table-responsive">
                <table id="balances-tbl" className="table table-striped">
                  <thead>
                    <tr>
                      <th>Coin</th>
                      <th>Issuer</th>
                      <th>Balance</th>
                      <th>USD Value</th>
                    </tr>
                  </thead>
                  <tbody></tbody>
                </table>
              </div>
            </div>
        );
    }
}
// ========================================
ReactDOM.render(
    <PortfolioTable />,
   document.getElementById('portfolio-table'),
);
