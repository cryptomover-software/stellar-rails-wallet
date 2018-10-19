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
import {progressBar, submitTransaction} from './helper';


class SignTransactionForm extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            seed: '',
            sign: true,
            formIsValid: true,
            disabled: false,
            fields: {},
            errors: {}
        };
    }
    signTransaction(e) {
        this.setState({sign: !this.state.sign});
    }
    validateKeyInput(e) {
        const name = e.target.name;
        const value = e.target.value;
        let errors = this.state.errors;

        if(value.length != 0) {
            this.setState({formIsValid: true});
            errors[name] = null;
            this.setState({errors: errors});
            this.setState({[name]: value});
        } else {
            this.setState({formIsValid: false});
            if (name=='trxObject') {
                errors[name] = "Transaction object can not be empty.";
            } else {
                errors[name] = "This key can not be empty.";
            }
            this.setState({errors: errors});
            this.setState({[name]: value});
        }
        return this.state.formIsValid;
    }
    formValidForSubmission() {
        var errors = {};
        var seed = this.state.seed;
        if(!this.state.seed) {
            this.setState({formIsValid: false});
            this.setState({errors: {'seed': 'Seed can not be empty.'}});
            return false;
        }
        if (!this.state.trxObject) {
            this.setState({formIsValid: false});
            this.setState({errors: {'trxObject': 'Transactoin object can not be empty.'}});
            return false;
        }
        try {
            StellarSdk.Keypair.fromSecret(seed);
        } catch(error) {
            errors = {'seed': 'Invalid Private Seed.'};
            this.setState({errors: errors});
            this.setState({formIsValid: false});
            return false;
        }
        var kp1 = StellarSdk.Keypair.fromPublicKey(publicKey);
        var kp2 = StellarSdk.Keypair.fromSecret(seed);
        if (kp1.publicKey() != kp2.publicKey()) {
            errors = {'seed': 'Privase Seed does not match with your Account.'};
            this.setState({errors: errors});
            this.setState({formIsValid: false});
            return false;
        }
        this.setState({formIsValid: true});
        return true;
    }
    signAndSubmitTransaction() {
        if (this.formValidForSubmission()) {
            var sign = this.state.sign;
            var seed = this.state.seed;
            var trxObject = this.state.trxObject;
            var server = new StellarSdk.Server('https://horizon.stellar.org');
            var keypair = '';
            StellarSdk.Network.usePublicNetwork();
            keypair = StellarSdk.Keypair.fromSecret(seed);

            if (keypair.length != 0) {
                this.setState({formIsValid: false});
                this.setState({disabled: !this.state.disabled});
                progressBar();
                server.loadAccount(publicKey)
                    .then(function(account) {   
                        var transaction = new StellarSdk.Transaction(trxObject);
                        if (sign) {
                            transaction.sign(keypair);
                        }
                        submitTransaction(transaction, server, 'signAndSubmitTrx');
                    });
            }
        }
    }
    createSignTransactionObject() {
        if (this.formValidForSubmission()) {
            var sign = this.state.sign;
            var seed = this.state.seed;
            var trxObject = this.state.trxObject;
            var server = new StellarSdk.Server('https://horizon.stellar.org');
            var keypair = '';
            StellarSdk.Network.usePublicNetwork();
            keypair = StellarSdk.Keypair.fromSecret(seed);

            if (keypair.length != 0) {
                this.setState({formIsValid: false});
                this.setState({disabled: !this.state.disabled});
                progressBar();
                server.loadAccount(publicKey)
                    .then(function(account) {   
                        var transaction = new StellarSdk.Transaction(trxObject);
                        transaction.sign(keypair);
                        var xdr = transaction.toEnvelope().toXDR('base64');
                        document.getElementById("progressbar").style.display = 'None';
                        document.getElementById('st-transaction').innerHTML = "Transaction Object: <br>" + xdr;
                    });                
            }
        }
    }

    render() {
        return (
            <div>
              <div className="form-group">
                <div className="form-label">
                  Your Public Key 
                </div>
                <input className="form-control" id="source-account" value={this.props.publicKey} disabled="disabled" type="text" />
              </div>
              <div className="form-group">
                <div className="form-label">
                  Your Private Seed 
                </div>
                <input onChange={(event) => this.validateKeyInput(event)} className="form-control" id="seed" disabled={this.state.disabled} type="password" name="seed" placeholder="Enter your private seed here"/>
                <span style={{color: "red"}}>{this.state.errors["seed"]}</span>
              </div>
              <div className="form-group">
                <div className="form-label">
                  Transaction Object 
                </div>
                <textarea onChange={(event) => this.validateKeyInput(event)} className="form-control" id="transaction-object" disabled={this.state.disabled} type="d" name="trxObject" placeholder="Enter transaction object here"/>
                <span style={{color: "red"}}>{this.state.errors["trxObject"]}</span>
              </div>
              <div className="form-inline mt-1">
                <div className="form-check form-check-inline">
                  <input onChange={(event) => this.signTransaction(event)} className="form-check-input" id="inlineCheckbox1" type="checkbox" value="do_not_change_threshold" name="sign" disabled={this.state.disabled}/>
                <label className="form-check-label" htmlFor="inlineCheckbox1">Do not sign transaction object.</label>
                </div>
              </div>
              <hr></hr>
              <div className="fee-prompt mb-2 mt-2 text-danger">
                Stellar Network changes a transaction fee of 0.00001 XLM for each transaction
                <div className="container-fluid">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="text-right">
                        <button onClick={ () => this.signAndSubmitTransaction() } type="button" className="btn btn-danger" id="submit-transaction-btn" disabled={!this.state.formIsValid}>
                          Submit
                        </button>
                        <button onClick={ () => this.createSignTransactionObject()} type="button" className="btn btn-brown" id="create-sign-transaction-btn" disabled={!this.state.formIsValid}>
                          Create Transaction
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>              
            </div>
        );
    }
}

// ========================================

const node = document.getElementById('sign-transaction-card');
const publicKey = JSON.parse(node.getAttribute('data-address'));

ReactDOM.render(
    <SignTransactionForm publicKey={publicKey}/>,
   document.getElementById('sign-transaction-form'),
);

