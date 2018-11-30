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
import {progressBar, scrollToDiv, processTransfer, historyAndAssetsAPI} from './helper';

const limit = 10;
const apiURL = 'https://horizon.stellar.org';

class TransactionHistory extends React.Component {
    constructor (props) {
    super(props);
        this.state = {
            address: this.props.address,
            data: [],
            next: '',
            prev: '',
            errors: {}
        };
        progressBar();
    }
    componentDidMount() {
        // display first set of transactions history
        var endpoint = "/accounts/" + this.state.address + "/payments?limit=" + limit;
        var url = apiURL + endpoint;
        historyAndAssetsAPI(url, this);
    }
    fetchTransaction(type) {
        // fetch transaction history set as per button
        // and display it
        progressBar();
        var endpoint = '';
        var url = '';
        if (type=='next') {
            historyAndAssetsAPI(this.state.next, this);
        } else if (type=='prev') {
            historyAndAssetsAPI(this.state.prev, this);
        } else if (type=='first' || !type) {
            endpoint = "/accounts/" + this.state.address + "/payments?limit=" + limit;
            url = apiURL + endpoint;
            historyAndAssetsAPI(url, this);
        } else if (type=='last') {
            endpoint = "/accounts/" + this.state.address + "/payments?limit=" + limit + "&order=desc";
            url = apiURL + endpoint;
            historyAndAssetsAPI(url, this);
        }
    }
    render() {
        return (
            <div>
              <div className="mb-1">
                <button onClick={ () => this.fetchTransaction('first') } className="btn btn-brown">
                  First
                </button>
                <button onClick={ () => this.fetchTransaction('prev') } className="btn btn-brown">
                  Prev
                </button>
                <button onClick={ () => this.fetchTransaction('next') } className="btn btn-brown">
                  Next
                </button>
                <button onClick={ () => this.fetchTransaction('last') } className="btn btn-brown">
                  Last
                </button>
              </div>
              <div className="table-responsive">
                <table id="transactions-tbs" className="table table-striped table-sm">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Time</th>
                      <th>Type</th>
                      <th>Asset Code</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.data.map((item, i) => {
                        return [
                            <tr key={i}>
                              <td>{item['id']}</td>
                              <td>{item['created_at']}</td>
                              <td>{item['type']}</td>
                              <td>{item['asset_code']}</td>
                              <td className="short-address">{item['from']}</td>
                              <td className="short-address">{item['to']}</td>
                              <td>{item['amount']}</td>
                            </tr>
                        ];
                    })}
                  </tbody>
              </table>
              </div>
            </div>
        );
    }
}
// ========================================
const node = document.getElementById('transactions-card');
const address = JSON.parse(node.getAttribute('data-address'));

ReactDOM.render(
    <TransactionHistory address={address}/>,
   document.getElementById('history-nav'),
);
