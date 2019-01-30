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
import {progressBar, scrollToDiv, processTransfer} from './helper';

class SendAssets extends React.Component {
    constructor (props) {
    super(props);
        this.state = {
            address: this.props.address,
            targetFedAddress: '',
            formIsValid: false,
            disabled: false,
            sign: true,
            seed: "",
            assetCode: "XLM",
            assetIssuer: "",
            targetKey: "",
            memo: "",
            amount: 0.0,
            errors: {},
            agreeTerms: false,
            fundAccount: false
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
        var assetIssuer = "";

        if (value != "Lumens") {
            // get first part before comma from the string
            // and remove all the whitespaces in that string
            assetCode = value.split(',')[0].replace(/\s/g,'');
            assetIssuer = value.split(',')[1].replace(/\s/g,'');
            // set asset code and issuer.
            this.setState({assetCode: assetCode});
            this.setState({assetIssuer: assetIssuer});
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
        // resolve federation address to its Stellar key
        const self = this;
        const value = e.target.value.replace(/\s/g,'');
        if (value.includes('*') == true) {
            $('#resolve-fed-address').show();
            // disable button while we are resolving
            $('#send_money').attr('disabled', 'disabled');
            $.ajax({
                method: 'GET',
                url: "/get_federation_address",
                data: {address: value},
                success: function(publicKey) {
                    self.setState({targetFedAddress: publicKey});
                    $('#resolve-fed-address').text(' Resolved to: ' + publicKey);
                    $('#send_money').removeAttr('disabled');
                }
            });
        }
    }
    // set the amount to the max amount allowed
    sendMaxAmount(e) {
        // set max amount value in input box
        const value = $('#send-max').text();
        const amount = parseFloat(value.split(":")[1]);
        $("#amount-to-send").val(amount.replace(/\s/g,''));
    }
    enableMemoInput() {
        $("#memo").prop("disabled", false);
    }
    validateKeyInput(e, type) {
        const name = e.target.name;
        const value = e.target.value;
        if (type=='targetKey') {
            if(value) {
                this.setState({formIsValid: true});
                this.setState({errors: {'targetKey': null}});
                this.setState({targetKey: e.target.value});
            } else {
                this.setState({formIsValid: false});
                this.setState({errors: {'targetKey': 'Please enter Key.'}});
                this.setState({targetKey: e.target.value});
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
        const name = e.target.name;
        const value = e.target.value;

        if (type=='amount') {
            if(e.target.value) {
                this.setState({formIsValid: true});
                this.setState({errors: {'amount': null}});
                this.setState({amount: e.target.value});
            } else {
                this.setState({formIsValid: false});
                this.setState({errors: {'amount': 'Amount can not be empty.'}});
                this.setState({amount: e.target.value});
            }
        } else if (type=='memo') {
            if(e.target.value) {
                this.setState({formIsValid: true});
                this.setState({errors: {'memo': null}});
                this.setState({memo: e.target.value});
            } else {
                this.setState({formIsValid: false});
                this.setState({errors: {'memo': 'Memo can not be empty.'}});
                this.setState({memo: e.target.value});
            }
        }
    }
    agreeTerms(e) {
        this.setState({agreeTerms: e.target.checked});
    }
    fundAccount(e) {
        this.setState({fundAccount: e.target.checked});
    }
    formValidForSubmission() {
        var errors = {};
        if (!this.state.targetKey) {
            this.setState({formIsValid: false});
            this.setState({errors: {'targetKey': 'Please enter Key.'}});
            this.setState({targetKey: ''});
            return false;
        } else if (!this.state.amount) {
            this.setState({formIsValid: false});
            this.setState({errors: {'amount': 'Amount can not be empty.'}});
            this.setState({amount: ''});
            return false;
        } else if (!this.state.seed) {
            this.setState({formIsValid: false});
            this.setState({errors: {'seed': 'Please enter Key.'}});
            this.setState({seed: ''});
            return false;
        }
        return true;
    }
    sendMoney(createTrx) {
        // initiate send asset process
        if (this.formValidForSubmission()) {
            const fundAccount = this.state.fundAccount;
            const targetKey = this.state.targetKey;
            const sourcePublicKey = this.state.adderss;

            if (!this.state.agreeTerms) {
                $("#layout-alert").show();
                $("#layout-alert").html("Please read and Accept Terms and Conditions.");
                scrollToDiv('#layout-alert');
                return ;
            } else {
                $("#layout-alert").hide();
            }
            this.setState({disabled: true});
            $("#memo").prop("disabled", "disabled");
            progressBar();

            if (this.state.targetKey.includes('*') == true) {
                var address = $('#resolve-fed-address').text().split(':')[1];
                var targetFedAddress = address.replace(/\s/g,'');
                processTransfer(fundAccount, targetKey, targetFedAddress, createTrx, this);
            } else {
                processTransfer(fundAccount, targetKey, null, createTrx, this);
            }
        }
    }
    signTransaction(e) {
        this.setState({sign: !this.state.sign});
    }
    render() {
        return (
            <div>
              <div className="form-group">
                <div className="form-label">
                  Recipients Public Key OR Federation Address
                </div>
                <input onChange={(event) => this.validateKeyInput(event, 'targetKey')} onBlur={(event) => this.resolveFederationAddress(event)} className="form-control" id="target-account" name="address" placeholder="Recipient's public key or Federation address" type="text" disabled={this.state.disabled}/>
                <span style={{color: "red"}}>{this.state.errors["targetKey"]}</span>
                <span onChange={(event) => this.readFedAddress(event)} className="text-danger mt-1" id="resolve-fed-address">
                  Resolving Federation Address...
                </span>
              </div>
              <div className="form-group">
                <div className="form-label">
                  Asset Type
                  <select onChange={(event) => this.assetBalance(event)} name="asset_name" id="asset-type" className="form-control" defaultValue="Lumens" disabled={this.state.disabled}>
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
                  <input onChange={(event) => this.validateInput(event, 'amount')} className="form-control" id="amount-to-send" name="amount" placeholder="Amount to Transfer" type="number" disabled={this.state.disabled}/>
                  <span className="d-block mt-1" style={{color: "red"}}>{this.state.errors["amount"]}</span>
                  <button onClick={() => this.sendMaxAmount()} className="btn btn-brown bt-lg mt-2" id="send-max" disabled={this.state.disabled}>
                    Send Maximum Allowed:
                  </button>
                </div>
              </div>
              <div className="form-group">
                <div className="form-label">
                  Type your Secret Key
                </div>
                <input onChange={(event) => this.validateKeyInput(event, 'seed')} className="form-control" id="secret-seed" placeholder="Your Secret Key" required="" type="password" disabled={this.state.disabled}/>
                <span style={{color: "red"}}>{this.state.errors["seed"]}</span>
              </div>
              Memo Type
              <div className="form-check form-check-inline" id="memo-types">
                <label className="radio-inline">
                  <input onChange={() => this.enableMemoInput()} className="form-check-input" name="memotype" type="radio" value="text" disabled={this.state.disabled}/>
                  TEXT
                </label>
                <label className="radio-inline">
                  <input onChange={() => this.enableMemoInput()} className="form-check-input" name="memotype" type="radio" value="id" disabled={this.state.disabled}/>
                  ID
                </label>
                <label className="radio-inline">
                  <input onChange={() => this.enableMemoInput()} className="form-check-input" name="memotype" type="radio" value="hash" disabled={this.state.disabled}/>
                  HASH
                </label>
                <label className="radio-inline">
                  <input onChange={() => this.enableMemoInput()} className="form-check-input" name="memotype" type="radio" value="return" disabled={this.state.disabled}/>
                  RETURN
                </label>
              </div>
              <div className="form-group">
                <div className="form-label">
                  Memo
                </div>
                <input onChange={(event) => this.validateInput(event, 'memo')} className="form-control" id="memo" placeholder="Type Memo" type="text" disabled="disabled"/>
                <span style={{color: "red"}}>{this.state.errors["memo"]}</span>
              </div>
              <div className="form-check">
                <label className="form-check-label">
                  <input onClick={(event) => this.fundAccount(event)} className="form-check-input" id="fund-new-chk" name="fund-new" type="checkbox" value="fund-new" disabled={this.state.disabled}/>
                  Fund New Account
                </label>
              </div>
              <div className="form-inline mt-1">
                <div className="form-check form-check-inline">
                  <input onChange={(event) => this.signTransaction(event)} className="form-check-input" id="inlineCheckbox1" type="checkbox" value="do_not_change_threshold" name="sign" disabled={this.state.disabled}/>
                <label className="form-check-label" htmlFor="inlineCheckbox1">Do not sign transaction object.</label>
                </div>
              </div>
              <hr></hr>
              <div className="form-check">
                <label className="form-check-label">
                  <input onClick={(event) => this.agreeTerms(event)} className="form-check-input" id="agree-terms-chk" name="agree-transfer-terms" type="checkbox" value="agree-terms" disabled={this.state.disabled}/>
                  I agree to
                  <a href="https://github.com/cryptomover-software/stellar-rails-wallet/blob/master/LICENSE">Terms &amp; Conditions.</a>
                </label>
              </div>
              <div id="progressbar" className="mt-2 mb-1"></div>
              <div className="fee-prompt mb-2 mt-2 text-danger">
                Stellar Network charges a transaction fee of 0.00001 XLM for each transaction
              </div>
              <div className="container-fluid">
                <div className="row">
                  <div className="col">
                    <div className="text-right">
                      <button onClick={ () => this.sendMoney(false) } className="btn btn-danger" id="send_money" type="button" disabled={this.state.disabled}>
                        Send Money
                      </button>
                      <button onClick={() => this.sendMoney(true)} className="btn btn-brown" id="create-send-money-trx" type="button" disabled={this.state.disabled}>
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
const address = JSON.parse(node.getAttribute('data-address'));

ReactDOM.render(
    <SendAssets assets={assets} address={address}/>,
   document.getElementById('transfer-assets-form'),
);
