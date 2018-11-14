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
        // get balance data
        $.ajax({
            method: "GET",
            url: "/get_balance",
            data: {code: "XLM"}
        }).done(function(result) {
            $("#available-balance").text(result[0]);
            $("#send-max").text("Send Maximum Allowed: " + result[1]);
        });
    }
    assetBalance(e) {
        const name = e.target.name;
        const value = e.target.value;
        var assetCode = "XLM";

        if (value != "Lumens") {
            // get first part before comma from the string
            // and remove all the whitespaces in that string
            assetCode = value.split(',')[0].replace(/\s/g,'');
        }
        $('#send-max').text("Fetching...");
        $("#amount-to-send").val("");
        $("#amount-to-send").attr("placeholder", "Amount to Transfer");

        $.ajax({
            method: "GET",
            url: "/get_balance",
            data: {code: assetCode}
        }).done(function(result) {
            $("#available-balance").text(result[0] + " ");
            $("#send-max").text("Send Maximum Allowed: " + result[1]);
        });
    }
    resolveFederationAddress(e) {
        const value = e.target.value.replace(/\s/g,'');
        if (value.includes('*') == true) {
            $('#resolve-fed-address').show();
            // disable button while we are resolving
            $('#send_money').attr('disabled', 'disabled');
            $.ajax({
                method: 'GET',
                url: "/get_federation_address",
                data: {address: inputKey},
                success: function(publicKey) {
                    $('#resolve-fed-address').text(' Resolved to: ' + publicKey);
                    $('#send_money').removeAttr('disabled');
                }
            });
        }
    }
    // set the amount to the max amount allowed
    sendMaxAmount(e) {
        const value = $('#send-max').text();
        var amount = parseFloat(value.split(":")[1]);
        $("#amount-to-send").val(amount);
    }
    enableMemoInput() {
        $("#memo").prop("disabled", false);
    }
    validateKeyInput(e, type) {
        const name = e.target.name;
        const value = e.target.value;
        if (type=='targetKey') {
            if(e.target.value) {
                this.setState({formIsValid: true});
                this.setState({errors: {'targetKey': null}});
                this.setState({seed: e.target.value});
            } else {
                this.setState({formIsValid: false});
                this.setState({errors: {'targetKey': 'Please enter Key.'}});
                this.setState({seed: e.target.value});
            }
        } else if (type=='seed') {
            if(e.target.value) {
                this.setState({formIsValid: true});
                this.setState({errors: {'seed': null}});
                this.setState({seed: e.target.value});
            } else {
                this.setState({formIsValid: false});
                this.setState({errors: {'seed': 'Please enter Key.'}});
                this.setState({seed: e.target.value});
            }
        }
    }
    validateInput(e, type) {
        console.log("validating");
        const name = e.target.name;
        const value = e.target.value;

        if (type=='amount') {
            if(e.target.value) {
                this.setState({formIsValid: true});
                this.setState({errors: {'amount': null}});
                this.setState({seed: e.target.value});
            } else {
                this.setState({formIsValid: false});
                this.setState({errors: {'amount': 'Amount can not be empty.'}});
                this.setState({seed: e.target.value});
            }
        } else if (type=='memo') {
            if(e.target.value) {
                this.setState({formIsValid: true});
                this.setState({errors: {'memo': null}});
                this.setState({seed: e.target.value});
            } else {
                this.setState({formIsValid: false});
                this.setState({errors: {'memo': 'Memo can not be empty.'}});
                this.setState({seed: e.target.value});
            }
        }
    }
    render() {
        return (
            <div>
              <div className="form-group">
                <div className="form-label">
                  Recipients Public Key OR Federation Address
                </div>
                <input onChange={(event) => this.validateKeyInput(event, 'targetKey')} onBlur={(event) => this.resolveFederationAddress(event)} className="form-control" id="target-account" name="address" placeholder="Recipient's public key or Federation address" required="" type="text"/>
                <span style={{color: "red"}}>{this.state.errors["targetKey"]}</span>
                <span className="text-danger mt-1" id="resolve-fed-address">
                  Resolving Federation Address...
                </span>
              </div>
              <div className="form-group">
                <div className="form-label">
                  Asset Type
                  <select onChange={(event) => this.assetBalance(event)} name="asset_name" id="asset-type" className="form-control" defaultValue="Lumens">
                    {this.props.assets.map((x, y)=><option key={y} value={x} >{x}</option>)};
                  </select>
                </div>
                <div className="text-muted mt-1">
                  Balance: &nbsp;
                  <span id="available-balance"></span>
                </div>
              </div>
              <div className="form-group">
                <div className="form-label">
                  Amount
                  <input onChange={(event) => this.validateInput(event, 'amount')} className="form-control" id="amount-to-send" name="amount" placeholder="Amount to Transfer" type="number"/>
                  <span className="d-block mt-1" style={{color: "red"}}>{this.state.errors["amount"]}</span>
                  <button onClick={() => this.sendMaxAmount()} className="btn btn-brown bt-lg mt-2" id="send-max">
                    Send Maximum Allowed:
                  </button>
                </div>
              </div>
              <div className="form-group">
                <div className="form-label">
                  Type your Secret Key
                </div>
                <input onChange={(event) => this.validateKeyInput(event, 'seed')} className="form-control" id="secret-seed" placeholder="Your Secret Key" required="" type="password"/>
                <span style={{color: "red"}}>{this.state.errors["seed"]}</span>
              </div>
              Memo Type
              <div className="form-check form-check-inline" id="memo-types">
                <label className="radio-inline">
                  <input onChange={() => this.enableMemoInput()} className="form-check-input" name="memotype" type="radio" value="text"/>
                  TEXT
                </label>
                <label className="radio-inline">
                  <input onChange={() => this.enableMemoInput()} className="form-check-input" name="memotype" type="radio" value="id"/>
                  ID
                </label>
                <label className="radio-inline">
                  <input onChange={() => this.enableMemoInput()} className="form-check-input" name="memotype" type="radio" value="hash"/>
                  HASH
                </label>
                <label className="radio-inline">
                  <input onChange={() => this.enableMemoInput()} className="form-check-input" name="memotype" type="radio" value="return"/>
                  RETURN
                </label>
              </div>
              <div className="form-group">
                <div className="form-label">
                  Memo
                </div>
                <input onChange={(event) => this.validateInput(event, 'memo')} className="form-control" disabled="disabled" id="memo" placeholder="Type Memo" type="text"/>
                <span style={{color: "red"}}>{this.state.errors["memo"]}</span>
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
