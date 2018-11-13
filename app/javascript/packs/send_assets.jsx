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
import {progressBar, trustAssets} from './helper';

class SendAssets extends React.Component {
    constructor (props) {
    super(props);
        this.state = {
            address: this.props.address,
            formIsValid: false,
            disabled: 'true',
            seed: "",
            assedCode: "",
            assetIssuer: "",
            limit: 0.0,
            errors: {},
            rows: []
        };
    }
    render() {
        return (
            <div>
              <div className="form-group">
                <div className="form-label">
                  Recipients Public Key OR Federation Address
                </div>
                <input className="form-control" id="target-account" name="address" placeholder="Recipient's public key or Federation address" required="" type="text"/>
                <span className="text-danger mt-1" id="resolve-fed-address">
                  Resolving Federation Address...
                </span>
              </div>
              <div className="form-group">
                <div className="form-label">
                  Asset Type
                  <select name="asset_name" id="asset-type" className="form-control">
                    {this.props.assets.map((x, y)=><option value={x}>{x}</option>)};
                  </select>
                </div>
                <div className="text-muted mt-1">
                  Balance: &nbsp;
                  <span id="available-balance">4.89919</span>
                </div>
              </div>
              <div className="form-group">
                <div className="form-label">
                  Amount
                  <input className="form-control" id="amount-to-send" name="amount" placeholder="Amount to Transfer" required="" type="number"/>
                  <button className="btn btn-brown bt-lg mt-2" id="send-max">
                    Send Maximum Allowed: 3.39918
                  </button>
                </div>
              </div>
              <div className="form-group">
                <div className="form-label">
                  Type your Secret Key
                </div>
                <input className="form-control" id="secret-seed" placeholder="Your Secret Key" required="" type="password"/>
              </div>
              Memo Type
              <div className="form-check form-check-inline" id="memo-types">
                <label className="radio-inline">
                  <input className="form-check-input" name="memotype" type="radio" value="text"/>
                  TEXT
                </label>
                <label className="radio-inline">
                  <input className="form-check-input" name="memotype" type="radio" value="id"/>
                  ID
                </label>
                <label className="radio-inline">
                  <input className="form-check-input" name="memotype" type="radio" value="hash"/>
                  HASH
                </label>
                <label className="radio-inline">
                  <input className="form-check-input" name="memotype" type="radio" value="return"/>
                  RETURN
                </label>
              </div>
              <div className="form-group">
                <div className="form-label">
                  Memo
                </div>
                <input className="form-control" disabled="" id="memo" placeholder="Type Memo" type="text"/>
              </div>
              <div className="form-check">
                <label className="form-check-label">
                  <input className="form-check-input" id="fund-new-chk" name="fund-new" type="checkbox" value="fund-new"/>
                  Fund New Account
                </label>
              </div>
              <hr></hr>
              <div className="form-check">
                <label className="form-check-label">
                  <input className="form-check-input" id="agree-terms-chk" name="agree-transfer-terms" type="checkbox" value="agree-terms"/>
                  I agree to
                  <a href="https://github.com/cryptomover-code/stellar-rails/blob/master/LICENSE">Terms &amp; Conditions.</a>
                </label>
              </div>
              <div className="fee-prompt mb-2 mt-2 text-danger">
                Stellar Network charges a transaction fee of 0.00001 XLM for each transaction
              </div>
              <div className="container-fluid">
                <div className="row">
                  <div className="col">
                    <div className="text-right">
                      <button className="btn btn-danger" id="send_money" type="button">
                        Send Money
                      </button>
                      <button className="btn btn-brown" id="create-send-money-trx" type="button">
                        Create Transaction
                      </button>
                      <a className="btn btn-brown" id="cancel-btn" href="/">Cancel</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        );
    }
}
// ========================================

const node = document.getElementById('transfer-assets-card');
const assets = JSON.parse(node.getAttribute('data-assets'));
// const address = JSON.parse(node.getAttribute('data-address'));

ReactDOM.render(
    <SendAssets assets={assets}/>,
   document.getElementById('transfer-assets-form'),
);
