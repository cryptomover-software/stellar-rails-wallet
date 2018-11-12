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

class TrustAssets extends React.Component {
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
            errors: {}
        };
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
                <input onChange={(event) => this.validateSeedInput(event)} className="form-control" id="secret-seed" type="password" autoComplete="off" name="seed" placeholder="Enter your privade seed"/>
                <span style={{color: "red"}}>{this.state.errors["seed"]}</span>
              </div>
              <div className="form-group">
                <div className="form-label">
                  Asset Code
                </div>
                <input onChange={(event) => this.validateInput(event, 'code')} className="form-control" id="asset-code" required="" type="text" autoComplete="off" placeholder="Enter Asset Code" name="assetCode"/>
                <span style={{color: "red"}}>{this.state.errors["assetCode"]}</span>
              </div>
              <div className="form-group">
                <div className="form-label">
                  Asset Issuer
                </div>
                <input onChange={(event) => this.validateInput(event, 'issuer')} className="form-control" id="asset-issuer" required="" type="text" placeholder="Enter Asset Issuer" name="assetIssuer"/>
                <span style={{color: "red"}}>{this.state.errors["assetIssuer"]}</span>
              </div>
              <div className="form-group">
                <div className="form-label">
                  Limit
                  <span className="text-muted">
                    &nbsp; (Optional)
                  </span>
                </div>
                <input onChange={(event) => this.validateInput(event, 'limit')} className="form-control" id="limit" required="" type="number" placeholder="Setting limit is optional." name="limit"/>
                <span style={{color: "red"}}>{this.state.errors["limit"]}</span>
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
                      <button className="btn btn-brown" id="create-trust-asset-trx" type="button" disabled={!this.state.formIsValid}>
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
