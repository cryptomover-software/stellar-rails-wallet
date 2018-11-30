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


class CreateFederationAddress extends React.Component {
    constructor (props) {
    super(props);
        this.state = {
            username: "",
            disabled: true,
            errors: {}
        };
    }
    validateEmail(e) {
        var name = e.target.name;
        var value = e.target.value;
        var errors = {};
        // basic email validator. as emails can not be verified
        // without actually sending email.
        var re = /\S+@\S+/;

        if (!value) {
            errors[name] = "Email can not be empty.";
            this.setState({errors: errors});
            return false;
        } else if(!re.test(value)) {
            errors[name] = "Invalid Email";
            this.setState({errors: errors});
            return false;
        } else {
            this.setState({disabled: false});
            this.setState({username: value});
            this.setState({errors: {}});
            return true;
        }
    }
    saveFederationAddress() {
        // disable form preventing more clicks
        this.setState({disabled: true});
        var username = this.state.username;
        $('#federation-form').hide();
        $('#create-federation-account').children().hide();
        $('#create-federation-account').append("<div class='alert alert-secondary'>Processing Federation Address...</div>");
        $.ajax({
            url: "/federations" ,
            type: "POST",
            data: {"federation": {"username": this.state.username}},
            success: function() {
                $('#create-federation-account').children().hide();
                $('#create-federation-account').append("<div class='alert alert-success'>You will receive confirmation email at " + username + " shortly.  Click on the link provided in that email to verify your email address. Your Federation account will be created and will be deposited with 2 XLM only after email verification. <br><b>Check SPAM Folder also.</b></div>");
            },
            error: function(jqXHR,textStatus,errorThrown) {
                $('#create-federation-account').children().hide();
                $('#create-federation-account').append("<div class='alert alert-danger'>ERROR! Address already exists.</div>");
            }
        });
    }
    render() {
        return (
            <div>
              <div id="create-federation-account">
                <hr></hr>
                <h3>
                  Federation Stellar Account
                </h3>
                <ul>
                  <li>
                    Federation Stellar address allows you to resolve email-like addresses such as &nbsp;
                    <b>
                      name@gmail.com*cryptomover.com &nbsp;
                    </b>
                    into your Stellar Account address &nbsp;
                    <div className="address">
                      {this.props.address}
                    </div>
                  </li>
                  <li>
                    <a href="https://www.stellar.org/developers/guides/concepts/federation.html">Click here</a>
to know more about Stellar Federation Addresses.
                  </li>
                </ul>
                <div id="federation-form">
                  <div className="text-muted">
                    The username is limited to printable UTF-8 with whitespace and the following characters excluded: &lt;*,&gt;
                  </div>
                  <form id="new_federation" remote="true">
                    <label htmlFor="federation_enter_email_address">
                      Enter email address
                    </label>
                    <div className="form-group form-inline">
                      <input onChange={(event) => this.validateEmail(event)} id="fed-address" className="form-control" width="70%" placeholder="Enter Email" type="text" name="username" autoComplete="off"/>
                      <span className="alert alert-danger" id="fed-address-error"></span>*cryptomover.com
                    </div>
                    <span style={{color: "red"}}>{this.state.errors["username"]}</span>
                    <div className="text-muted mb-1">
                      Your federation address will be created only after verifying your email address.
                    </div>
                    <input onClick={() => this.saveFederationAddress()} disabled={this.state.disabled} type="submit" name="commit" value="Save Federation Address" id="fed-address-submit" className="btn btn-brown" />
                  </form>
                </div>
              </div>
            </div>
        );
    }
}

// ========================================

class CreateFederationBtn extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            showForm: false
        };
    }
    renderForm() {
        this.setState({showForm: true});
        return false;
    }
    render() {
        return (
            <div>
              { !this.state.showForm ? <button onClick={() => this.renderForm()} className="btn btn-brown" id="create-federaiton-address-btn"> Create Federation Address </button> : null }
              { this.state.showForm ? <CreateFederationAddress address={this.props.address}/> : null }
            </div>
        );
    }
}

// ========================================

const node = document.getElementById('public-address');
const address = JSON.parse(node.getAttribute('data-address'));

ReactDOM.render(
    <CreateFederationBtn address={address}/>,
   document.getElementById('create-federation-account'),
);
