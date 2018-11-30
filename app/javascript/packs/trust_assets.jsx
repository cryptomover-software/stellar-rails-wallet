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
import {progressBar, trustAssets, createTrustTransaction} from './helper';
const queryString = require('query-string');

class TrustAssets extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            address: this.props.address,
            formIsValid: false,
            disabled: null,
            sign: true,
            seed: "",
            assetCode: "",
            assetIssuer: "",
            limit: 0.0,
            errors: {}
        };
    }
    componentDidMount() {
        // if user came to this page by clicking on Trust button from
        // Browse Asset page,
        // then show the code and issuer which user wants to trust
        const parsed = queryString.parse(location.search);
        this.setState({assetCode: parsed.asset_code});
        this.setState({assetIssuer: parsed.asset_issuer});
    }
    validateSeedInput(e) {
        const name = e.target.name;
        const value = e.target.value;
        if(e.target.value) {
            this.setState({formIsValid: true});
            this.setState({errors: {'seed': null}});
            this.setState({seed: e.target.value});
        } else {
            this.setState({formIsValid: false});
            this.setState({errors: {'seed': 'Please enter private seed.'}});
            this.setState({seed: e.target.value});
        }
    }
    validateInput(e, type) {
        const name = e.target.name;
        const value = e.target.value;
        if (type=='code') {
            this.setState({assetCode: value});
            if (!value) {
                this.setState({formIsValid: false});
                this.setState({errors: {'assetCode': 'Asset Code can not be empty'}});
                return;
            }
        } else if (type=='issuer') {
            this.setState({assetIssuer: value});
            if (!value) {
                this.setState({formIsValid: false});
                this.setState({errors: {'assetIssuer': 'Asset Issuer can not be empty'}});
                return;
            }
        } else if (type=='limit') {
            this.setState({limit: value});
            if (!value) {
                this.setState({formIsValid: false});
                this.setState({errors: {'limit': 'Limit can not be empty'}});
                return;
            }
        }
        this.setState({formIsValid: true});
        this.setState({errors: {}});
    }
    formValidForSubmission() {
        var errors = {};

        if (!this.state.assetCode) {
            this.setState({formIsValid: false});
            this.setState({errors: {'assetCode': 'Asset Code can not be empty'}});
        } else if (!this.state.assetIssuer) {
            this.setState({formIsValid: false});
            this.setState({errors: {'assetIssuer': 'Asset Issuer can not be empty'}});
        } else if (!this.state.limit) {
            this.setState({formIsValid: false});
            this.setState({errors: {'limit': 'Limit can not be empty'}});
        }
        this.setState({formIsValid: true});
        this.setState({errors: {}});
        return true;
    }
    trustAsset() {
        // submit transaction to network
        if (this.formValidForSubmission()) {
            progressBar();
            console.log("trusting");
            trustAssets(this.state.assetCode,
                        this.state.assetIssuer,
                        this.state.limit,
                        this.state.address,
                        this.state.seed);
        }
    }
    trustTransaction() {
        // only create transaction object and display it
        if (this.formValidForSubmission()) {
            this.setState({disabled: 'disabled'});
            var server = new StellarSdk.Server('https://horizon.stellar.org');
            var asset = new StellarSdk.Asset(this.state.assetCode, this.state.assetIssuer);
            var sourceKeyPair = StellarSdk.Keypair.fromSecret(this.state.seed);
            var limit = this.state.limit;
            var sign = this.state.sign;

            StellarSdk.Network.usePublicNetwork();
            server.loadAccount(this.state.address)
                .then(function(account){
                    var transaction = createTrustTransaction(limit, account, asset);
                    if (sign) {
                        transaction.sign(sourceKeyPair);
                    }
                    var xdr = transaction.toEnvelope().toXDR('base64');
                    document.getElementById('ct-trust-assets').innerHTML = "Transaction Object: <br>" + xdr;
                });
        }
    }
    signTransaction(e) {
        this.setState({sign: !this.state.sign});
    }
    render() {
        return (
            <div>
              <div className="form-label">
                Lumens Balance:
                <span>
                  &nbsp; {this.props.balance}
                </span>
              </div>
              <div className="form-group">
                <div className="form-label">
                  Public Key
                </div>
                <input className="form-control" disabled="disabled" id="source-account" type="text" value={this.props.address}/>
              </div>
              <div className="form-group">
                <div className="form-label">
                  Secret Seed
                </div>
                <input onChange={(event) => this.validateSeedInput(event)} className="form-control" id="secret-seed" type="password" autoComplete="off" name="seed" placeholder="Enter your privade seed" disabled={this.state.disabled}/>
                <span style={{color: "red"}}>{this.state.errors["seed"]}</span>
              </div>
              <div className="form-group">
                <div className="form-label">
                  Asset Code
                </div>
                <input onChange={(event) => this.validateInput(event, 'code')} className="form-control" id="asset-code" required="" type="text" autoComplete="off" placeholder="Enter Asset Code" name="assetCode" value={this.state.assetCode} disabled={this.state.disabled}/>
                <span style={{color: "red"}}>{this.state.errors["assetCode"]}</span>
              </div>
              <div className="form-group">
                <div className="form-label">
                  Asset Issuer
                </div>
                <input onChange={(event) => this.validateInput(event, 'issuer')} className="form-control" id="asset-issuer" required="" type="text" placeholder="Enter Asset Issuer" name="assetIssuer" value={this.state.assetIssuer} disabled={this.state.disabled}/>
                <span style={{color: "red"}}>{this.state.errors["assetIssuer"]}</span>
              </div>
              <div className="form-group">
                <div className="form-label">
                  Limit
                  <span className="text-muted">
                    &nbsp; (Optional. To delete asset from your account trust it with limit zero.)
                  </span>
                </div>
                <input onChange={(event) => this.validateInput(event, 'limit')} className="form-control" id="limit" required="" type="number" placeholder="Setting limit is optional." name="limit" disabled={this.state.disabled}/>
                <span style={{color: "red"}}>{this.state.errors["limit"]}</span>
              </div>
              <div className="form-inline mt-1">
                <div className="form-check form-check-inline">
                  <input onChange={(event) => this.signTransaction(event)} className="form-check-input" id="inlineCheckbox1" type="checkbox" value="do_not_change_threshold" name="sign" disabled={this.state.disabled}/>
                <label className="form-check-label" htmlFor="inlineCheckbox1">Do not sign transaction object.</label>
                </div>
              </div>
              <hr></hr>
              <div className="fee-prompt mb-2 mt-2 text-danger">
                Stellar Network charges a transaction fee of 0.00001 XLM for each transaction
              </div>
              <div className="container-fluid">
                <div className="row">
                  <div className="col">
                    <div className="text-right">
                      <button onClick={ () => this.trustAsset() } disabled={!this.state.formIsValid} className="btn btn-danger" id="trust-btn" type="button">
                        Trust Asset
                      </button>
                      <button onClick={ () => this.trustTransaction() } className="btn btn-brown" id="create-trust-asset-trx" type="button" disabled={!this.state.formIsValid}>
                        Create Transaction
                      </button>
                      <a className="btn btn-brown" id="cancel-btn" href="/">
                        Cancel
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        );
    }
}

// ========================================

const node = document.getElementById('trust-asset-card');
const balance = JSON.parse(node.getAttribute('data-balance'));
const address = JSON.parse(node.getAttribute('data-address'));

ReactDOM.render(
    <TrustAssets balance={balance} address={address}/>,
   document.getElementById('trust-assets-form'),
);
