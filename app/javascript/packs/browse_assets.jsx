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

const limit = 30;
const apiURL = 'https://horizon.stellar.org';

class BrowseAssets extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            data: [],
            next: '',
            prev: '',
            errors: {}
        };
        progressBar();
    }
    componentDidMount() {
        var endpoint = "/assets?limit=" + limit;
        var url = apiURL + endpoint;
        historyAndAssetsAPI(url, this);
    }
    trustAsset(e) {
        const code = e.target.getAttribute('data-asset-code');
        const issuer = e.target.getAttribute('data-asset-issuer');
        document.location.href = '/trust_asset?asset_code='+ code + '&asset_issuer=' + issuer;
    }
    fetchAssets(type) {
        progressBar();
        var endpoint = '';
        var url = '';
        if (type=='next') {
            historyAndAssetsAPI(this.state.next, this);
        } else if (type=='prev') {
            historyAndAssetsAPI(this.state.prev, this);
        } else if (type=='first' || !type) {
            endpoint = "/assets?limit=" + limit;
            url = apiURL + endpoint;
            historyAndAssetsAPI(url, this);
        } else if (type=='last') {
            endpoint = "/assets?limit=" + limit + "&order=desc";
            url = apiURL + endpoint;
            historyAndAssetsAPI(url, this);
        }
    }
    render() {
        return (
            <div>
              <div className="mb-1">
                <button onClick={ () => this.fetchAssets('first') } className="btn btn-brown">
                  First
                </button>
                <button onClick={ () => this.fetchAssets('prev') } className="btn btn-brown">
                  Prev
                </button>
                <button onClick={ () => this.fetchAssets('next') } className="btn btn-brown">
                  Next
                </button>
                <button onClick={ () => this.fetchAssets('last') } className="btn btn-brown">
                  Last
                </button>
              </div>
              <div className="table-responsive">
                <table id="assets-tbl" className="table table-striped">
                  <thead>
                    <tr>
                      <th>Asset Code</th>
                      <th>Asset Type</th>
                      <th>Asset Issuer</th>
                      <th>Action</th>
                      <th>TOML URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.data.map((item, i) => {
                        return [
                            <tr key={i}>
                              <td>{item['asset_code']}</td>
                              <td>{item['asset_type']}</td>
                              <td>{item['asset_issuer']}</td>
                              <td>
                                <button data-asset-code={item['asset_code']} data-asset-issuer={item['asset_issuer']} className="btn btn-brown trust-btn" onClick={(event) => this.trustAsset(event)}>
                                  Trust
                                </button>
                              </td>
                              <td>{item['_links']['toml']['href']}</td>
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
// const node = document.getElementById('transactions-card');
// const address = JSON.parse(node.getAttribute('data-address'));

ReactDOM.render(
    <BrowseAssets/>,
   document.getElementById('browse-assets'),
);
