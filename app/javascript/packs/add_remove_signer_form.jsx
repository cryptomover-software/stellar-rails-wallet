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
            'seedtwo': '',
            sign: true,
            formIsValid: true,
            disabled: false,
            fields: {},
            errors: {}
        };
        this.validateUserInput = this.validateUserInput.bind(this);
    }
    validateKeyInput(e) {
        const name = e.target.name;
        const value = e.target.value;
        let errors = this.state.errors;

        if(value.length != 0) {
            this.setState({formIsValid: true});
            this.setState({errors: {name: null}});
            this.setState({seed: value});
        } else {
            this.setState({formIsValid: false});
            errors[name] = "This key can not be empty.";
            this.setState({errors: errors});
            this.setState({[name]: value});
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
                This operation needs to be signer by signer(s) with individual or combined weight of >=
                {this.props.thresholds.high}
              </p>
              <div className="form-inline">
                <div className="form-check form-check-inline">
                  <input id="inlineCheckbox2" className="form-check-input" type="checkbox" value="do_not_submit" />
                  <label className="form-check-label" htmlFor="inlineCheckbox2">Do not sign transaction object.</label>
                </div>
              </div>
              <div className="form-group mt-1">
                <div className="form-label">
                  Your Secret Seed
                </div>
                <input onChange={(event) => this.validateKeyInput(event)} className="form-control" id="secret-seed-two" type="password" placeholder="Enter your secret seed here" name="seedtwo"/>
                <span style={{color: "red"}}>{this.state.errors["seedtwo"]}</span>
              </div>
              <div className="form-group mt-1">
                <div className="form-label">
                  New Signer Public Key
                </div>
                <input onChange={(event) => this.validateKeyInput(event)} className="form-control" id="signer-public-key" type="text" placeholder="Enter new signer public key here." name="new-public-key"/>
                <span style={{color: "red"}}>{this.state.errors["new-public-key"]}</span>
              </div>
              <div className="form-group mt-1">
                <div className="form-label">
                  New Signer Weight
                  <div className="text-muted d-inline">
                    (0-255)
                  </div>
                </div>
                <input onChange={(event) => this.validateUserInput(event)} className="form-control" id="signer-weight" type="text" placeholder="Enter new signer weight here." name="new-weight"/>
                <span style={{color: "red"}}>{this.state.errors["new-weight"]}</span>
              </div>              
              <div className="fee-prompt mb-2 mt-2 text-danger">
                Stellar Network charges a transaction fee of 0.00001 XLM for each transaction
              </div>
              <div className="container-fluid">
                <div className="row">
                  <div className="col-md-12">
                    <div className="text-right">
                      <button type="button" className="btn btn-brown" id="sumit-signer-btn" disabled={!this.state.formIsValid}>
                        Submit
                      </button>
                      <button type="button" className="btn btn-brown" id="crtr-signer-btn" disabled={!this.state.formIsValid}>
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

