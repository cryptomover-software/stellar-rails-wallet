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


class ChangeThresholdForm extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            low: this.props.thresholds.low,
            med: this.props.thresholds.med,
            high: this.props.thresholds.high,
            seed: '',
            sign: true,
            formIsValid: true,
            disabled: false,
            fields: {},
            errors: {}
        };
        this.validateUserInput = this.validateUserInput.bind(this);
    }
    signTransaction(e) {
        this.setState({signtwo: !this.state.signtwo});
    }
    formValidForSubmission() {
        var errors = {};
        var seed = this.state.seed;
        if(!this.state.seed) {
            this.setState({formIsValid: false});
            this.setState({errors: {'seed': 'Seed can not be empty.'}});
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
        var publicKey = document.getElementById('advanced-settings-card').getAttribute("data-address");
        var kp1 = StellarSdk.Keypair.fromPublicKey(publicKey);
        var kp2 = StellarSdk.Keypair.fromSecret(seed);
        if (kp1.publicKey() != kp2.publicKey()) {
            errors = {'seed': 'Privase Seed does not match with your Account.'};
            this.setState({errors: errors});
            this.setState({formIsValid: false});
            return false;
        }
        this.setState({formIsValid: true});
        return false;
    }
    validateSeedInput(e) {
        if(e.target.value) {
            this.setState({formIsValid: true});
            this.setState({errors: {'seed': null}});
            this.setState({seed: e.target.value});
        }
    }
    validateUserInput(e) {
        let formIsValid = this.state.formIsValid;
        let fields = this.state.fields;
        let errors = this.state.errors;
        const name = e.target.name;
        const value = e.target.value;
        fields[name] = value;
        
        if(!fields[name]){
           formIsValid = false;
           errors[name] = "Cannot be empty";
        } else if (!(parseInt(value) >= 0) || !(parseInt(value) <= 255)) {
            formIsValid = false;
            errors[name] = "Must be between 0-255";
        } else {
            formIsValid = true;
            errors[name] = null;
        }

        this.setState({errors: errors});
        this.setState({[name]: value});
        this.setState({formIsValid: formIsValid});
    }
    changeThreshold() {
        if (this.formValidForSubmission()) {
            var card = document.getElementById('advanced-settings-card');
            var publicKey = card.getAttribute("data-address");
            var low = this.state.low;
            var med = this.state.med;
            var high = this.state.high;
            var sign = this.state.sign;
            var seed = this.state.seed;
            var keypair = '';
            keypair = StellarSdk.Keypair.fromSecret(seed);

            if (keypair.length != 0) {
                this.setState({disabled: !this.state.disabled});
                progressBar();
                var server = new StellarSdk.Server('https://horizon.stellar.org');
                StellarSdk.Network.usePublicNetwork();

                server.loadAccount(publicKey)
                    .then(function(account) {
                        var sum_weight = 0;
                        for (var i = 0; i < account.signers.length; i++) {
                            sum_weight += parseInt(account.signers[i]['weight']);
                        }
                        if (high < sum_weight) {
                            var transaction = new StellarSdk.TransactionBuilder(account)
                                .addOperation(StellarSdk.Operation.setOptions({
                                    lowThreshold: parseInt(low),
                                    medThreshold: parseInt(med),
                                    highThreshold: parseInt(high)
                                }))
                                .addMemo(StellarSdk.Memo.text('modifying threshold.'))
                                .build();
                                transaction.sign(keypair);
                            submitTransaction(transaction, server, 'changeThreshold');
                        } else {
                            var message = "First add signer(s) with succifient weight before changing High Threshold Level. You tried to change High Threshold to " + high + ", but sum of your signers weight is only " + sum_weight.toString();
                            document.location.href = '/failed?error_description=' + message;
                        }
                });
            }
        }
    }
    createThresholdTransactionObject() {
        if (this.formValidForSubmission()) {
            var publicKey = document.getElementById('advanced-settings-card').getAttribute("data-address");
            var low = this.state.low;
            var med = this.state.med;
            var high = this.state.high;
            var sign = this.state.sign;
            var seed = this.state.seed;
            var server = new StellarSdk.Server('https://horizon.stellar.org');
            var keypair = '';
            StellarSdk.Network.usePublicNetwork();
            keypair = StellarSdk.Keypair.fromSecret(seed);

            if (keypair.length != 0) {
                this.setState({disabled: !this.state.disabled});
                progressBar();
                server.loadAccount(publicKey)
                    .then(function(account) {   
                        var transaction = new StellarSdk.TransactionBuilder(account)
                            .addOperation(StellarSdk.Operation.setOptions({
                                lowThreshold: parseInt(low),
                                medThreshold: parseInt(med),
                                highThreshold: parseInt(high)
                            })).build();
                        if (sign) {
                            transaction.sign(keypair);
                        }
                        var xdr = transaction.toEnvelope().toXDR('base64');
                        document.getElementById("progressbar").style.display = 'None';
                        // console.log("adding to ct-transaction div");
                        document.getElementById('ct-transaction').innerHTML = "Transaction Object: <br>" + xdr;
                    });                
            }
        }
    }

    render() {
        return (
            <div>
              <div className="row">
                <div className="col">
                  <div className="form-label">
                    Low Threshold
                    <div className="text-muted d-inline">
                      (0-255)
                    </div>
                  </div>
                  <input onChange={(event) => this.validateUserInput(event)} className="form-control mr-sm-2" id="low-threshold" value={this.state.low} type="text" name="low" pattern="\d*" disabled={this.state.disabled}/>
                  <span style={{color: "red"}}>{this.state.errors["low"]}</span>
                </div>
                <div className="col">
                  <div className="form-label">
                    Medium Threshold
                    <div className="text-muted d-inline">
                      (0-255)
                    </div>
                  </div>
                  <input onChange={(event) => this.validateUserInput(event)} className="form-control mr-sm-2" id="med-threshold" value={this.state.med} type="text" pattern="\d*" name="med" disabled={this.state.disabled}/>
                  <span style={{color: "red"}}>{this.state.errors["med"]}</span>
                </div>
                <div className="col">
                  <div className="form-label">
                    High Threshold
                    <div className="text-muted d-inline">
                      (0-255)
                    </div>
                  </div>
                  <input onChange={(event) => this.validateUserInput(event)} className="form-control mr-sm-2" id="high-threshold" value={this.state.high} type="text" pattern="\d*" name="high" disabled={this.state.disabled}/>
                  <span style={{color: "red"}}>{this.state.errors["high"]}</span>
                </div>
              </div>
              <div className="mt-1">
                Change Threshold is a High Level Operation.
                <br></br>
                Your High Threshold is:
                {this.props.thresholds.high}
                <br></br>
                Master key weight is:
                {this.props.master_weight}
                <div className="text-danger">
                  This operation needs to be signed by signer(s) with individual or combined weight of >=
                  {this.props.thresholds.high}
                </div>
              </div>
              <div className="form-inline mt-1">
                <div className="form-check form-check-inline">
                  <input onChange={(event) => this.signTransaction(event)} className="form-check-input" id="inlineCheckbox1" type="checkbox" value="do_not_change_threshold" name="sign" disabled={this.state.disabled}/>
                <label className="form-check-label" htmlFor="inlineCheckbox1">Do not sign transaction object.</label>
                </div>
              </div>
              <div className="form-group mt-1">
                <div className="form-label">
                  Your Secret Seed
                </div>
                <input onChange={(event) => this.validateSeedInput(event)} className="form-control" id="secret-seed-one" type="password" value={this.state.seed} name="seed" placeholder="Enter your privade seed here" disabled={this.state.disabled}/>
                <span style={{color: "red"}}>{this.state.errors["seed"]}</span>
              </div>
              <div className="fee-prompt mb-2 mt-2 text-danger">
                Stellar Network changes a transaction fee of 0.00001 XLM for each transaction
                <div className="container-fluid">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="text-right">
                        <button onClick={ () => this.changeThreshold() } type="button" className="btn btn-brown" id="change-threshold-btn" disabled={!this.state.formIsValid}>
                          Change Threshold
                        </button>
                        <button onClick={ () => this.createThresholdTransactionObject()} type="button" className="btn btn-brown" id="crtr-chng-trshld-btn" disabled={!this.state.formIsValid}>
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

const node = document.getElementById('thresholds_data');
const thresholdData = JSON.parse(node.getAttribute('data'));
const masterData = JSON.parse(node.getAttribute('data-master'));
ReactDOM.render(
    <ChangeThresholdForm thresholds={thresholdData} master_weight={masterData}/>,
   document.getElementById('change_threshold_form'),
);
