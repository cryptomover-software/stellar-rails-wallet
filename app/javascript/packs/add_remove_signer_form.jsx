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

class AddRemoveSignerForm extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            seedTwo: '',
            newPublicKey: '',
            weight: 0,
            memo: '',
            signtwo: true,
            formIsValid: true,
            disabled: false,
            fields: {},
            errors: {}
        };
        // this.validateUserInput = this.validateUserInput.bind(this);
    }
    signTransaction(e) {
        this.setState({signtwo: !this.state.signtwo});
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
            errors[name] = "This key can not be empty.";
            this.setState({errors: errors});
            this.setState({[name]: value});
        }
        return this.state.formIsValid;
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
        return this.state.formIsValid;
    }
    formValidForSubmission() {
        var seed = this.state.seedTwo;
        var errors = {};
        if(!seed) {
            this.setState({formIsValid: false});
            this.setState({errors: {'seedTwo': 'Seed can not be empty.'}});
            return false;
        }
        try {
            StellarSdk.Keypair.fromSecret(seed);
        } catch(error) {
            errors = {'seedTwo': 'Invalid Private Seed'};
            this.setState({errors: errors});
            this.setState({formIsValid: false});
            return false;
        }
        try {
            StellarSdk.Keypair.fromPublicKey(this.state.newPublicKey);
        } catch(error) {
            errors = {'newPublicKey': 'Invalid Public Key for new signer.'};
            this.setState({errors: errors});
            this.setState({formIsValid: false});
            return false;
        }
        var publicKey = document.getElementById('advanced-settings-card').getAttribute("data-address");
        var kp1 = StellarSdk.Keypair.fromPublicKey(publicKey);
        var kp2 = StellarSdk.Keypair.fromSecret(seed);
        if (kp1.publicKey() != kp2.publicKey()) {
            errors = {'seedTwo': 'Privase Seed does not match with your Account.'};
            this.setState({errors: errors});
            this.setState({formIsValid: false});
            return false;
        }
        this.setState({formIsValid: true});
        return true;
    };
    createSignerTransactionObject() {
        console.log("create signer txr obj");
        if (this.formValidForSubmission()) {
            var publicKey = document.getElementById('advanced-settings-card').getAttribute("data-address");
            var newSignerPublicKey = this.state.newPublicKey;
            var newSignerWeight = this.state.weight;
            var sign = this.state.signtwo;
            var seed = this.state.seedTwo;
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
                                signer: {
                                    ed25519PublicKey: newSignerPublicKey,
                                    weight: newSignerWeight
                                }
                            })).build();
                        if (sign) {
                            transaction.sign(keypair);
                        }
                        var xdr = transaction.toEnvelope().toXDR('base64');
                        document.getElementById("progressbar").style.display = 'None';
                        // console.log("adding to ct-transaction div");
                        document.getElementById('signer-transaction').innerHTML = "Transaction Object: <br>" + xdr;
                });
            }
        }
    }
    submitSignerTransaction() {
        if (this.formValidForSubmission()) {
            var publicKey = document.getElementById('advanced-settings-card').getAttribute("data-address");
            var newSignerPublicKey = this.state.newPublicKey;
            var newSignerWeight = this.state.weight;
            var sign = this.state.signtwo;
            var seed = this.state.seedTwo;
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
                                signer: {
                                    ed25519PublicKey: newSignerPublicKey,
                                    weight: newSignerWeight
                                }
                            }))
                            .addMemo(StellarSdk.Memo.text('modifying signer.'))
                            .build();
                        transaction.sign(keypair);
                        var trxType = 'addSigner';
                        if (newSignerWeight == 0) {
                            trxType = 'removeSigner';
                        }
                        submitTransaction(transaction, server, trxType);
                });
            }
        }
    }
    render() {
        return (
            <div>
              List of Signer(s)
              {this.props.signers}
              <br></br>
              Add/Remove Signer is a High Level Operation.
              <br></br>
              Your High Threshold is: &nbsp;
              {this.props.thresholds.high}
              <br></br>
              Master Key Weight: &nbsp;
              {this.props.master_weight}
              <p className="text-danger">
                This operation needs to be signed by signer(s) with individual or combined weight of >=
                {this.props.thresholds.high}
              </p>
              <div className="form-inline">
                <div className="form-check form-check-inline">
                  <input onChange={(event) => this.signTransaction(event)} id="inlineCheckbox2" className="form-check-input" type="checkbox" value="do_not_submit" name="signtwo"  disabled={this.state.disabled}/>
                  <label className="form-check-label" htmlFor="inlineCheckbox2">Do not sign transaction object.</label>
                </div>
              </div>
              <div className="form-group mt-1">
                <div className="form-label">
                  Your Secret Seed
                </div>
                <input onChange={(event) => this.validateKeyInput(event)} className="form-control" id="secret-seed-two" type="password" placeholder="Enter your secret seed here" name="seedTwo"  disabled={this.state.disabled}/>
                <span style={{color: "red"}}>{this.state.errors["seedTwo"]}</span>
              </div>
              <div className="form-group mt-1">
                <div className="form-label">
                  New Signer Public Key
                </div>
                <input onChange={(event) => this.validateKeyInput(event)} className="form-control" id="signer-public-key" type="text" placeholder="Enter new signer public key here." name="newPublicKey"  disabled={this.state.disabled}/>
                <span style={{color: "red"}}>{this.state.errors["newPublicKey"]}</span>
              </div>
              <div className="form-group mt-1">
                <div className="form-label">
                  New Signer Weight
                  <div className="text-muted d-inline">
                    (0-255)
                  </div>
                </div>
                <input onChange={(event) => this.validateUserInput(event)} className="form-control" id="signer-weight" type="text" placeholder="Enter new signer weight here." name="weight"  disabled={this.state.disabled}/>
                <span style={{color: "red"}}>{this.state.errors["weight"]}</span>
              </div>
              {/* <label> */}
              {/*   Meto Type: */}
              {/* </label> */}
              {/* <div className="form-check form-check-inline" id="memo-types"> */}
              {/*   <label className="radio-inline"> */}
              {/*     <input className="form-check-input" name="memotype" type="radio" value="text"/>TEXT */}
              {/*   </label> */}
              {/*   <label className="radio-inline"> */}
              {/*     <input className="form-check-input" name="memotype" type="radio" value="id"/>ID */}
              {/*   </label> */}
              {/*   <label className="radio-inline"> */}
              {/*     <input className="form-check-input" name="memotype" type="radio" value="hash"/>HASH */}
              {/*   </label> */}
              {/*   <label className="radio-inline"> */}
              {/*     <input className="form-check-input" name="memotype" type="radio" value="return"/>RETURN */}
              {/*   </label> */}
              {/* </div> */}
              {/* <div className="form-group mt-1"> */}
              {/*   <div className="form-label"> */}
              {/*     Memo */}
              {/*     <div className="text-muted d-inline"> */}
              {/*       (Optional) */}
              {/*     </div> */}
              {/*   </div> */}
              {/*   <input onChange={(event) => this.validateUserInput(event)} className="form-control" id="signer-memo" type="text" placeholder="Enter memo here." name="signerMemo"/> */}
              {/*   <span style={{color: "red"}}>{this.state.errors["signerMemo"]}</span> */}
              {/* </div>               */}
              <div className="fee-prompt mb-2 mt-2 text-danger">
                Stellar Network charges a transaction fee of 0.00001 XLM for each transaction
              </div>
              <div className="container-fluid">
                <div className="row">
                  <div className="col-md-12">
                    <div className="text-right">
                      <button onClick={ () => this.submitSignerTransaction()} type="button" className="btn btn-danger" id="sumit-signer-btn" disabled={!this.state.formIsValid}>
                        Submit
                      </button>
                      <button onClick={ () => this.createSignerTransactionObject()} type="button" className="btn btn-brown" id="crtr-signer-btn" disabled={!this.state.formIsValid}>
                        Create Transaction
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        );
    }
}

// ========================================
const node1 = document.getElementById('thresholds_data');
const thresholdData = JSON.parse(node1.getAttribute('data'));
const masterData = JSON.parse(node1.getAttribute('data-master'));
const node2 = document.getElementById('advanced-settings-card');
const signersData = JSON.parse(node2.getAttribute('data-signers'));

const signers = signersData.map((signer) => 
        <div key={signer.key}>
          {signer.public_key}, {signer.weight}
        </div>
);

ReactDOM.render(
    <AddRemoveSignerForm thresholds={thresholdData} master_weight={masterData} signers={signers}/>,
   document.getElementById('add_remove_signer_form'),
);

