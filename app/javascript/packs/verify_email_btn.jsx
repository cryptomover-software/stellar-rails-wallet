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
import {progressBar, appendDataToTable} from './helper';


class VerifyEmailBtn extends React.Component {
    constructor (props) {
        super(props);
        this.state = {};
        
    }
    resendEmail() {
        $("#verify-warning").text("Sending...");
        $("#verify-warning").addClass("alert");
        $("#verify-warning").addClass("alert-success");

        $.ajax({
            type: "GET",
            url: "/resend_confirmation_email"
        }).done(function(data) {
            if (data.split('!')[0] == 'ERROR') {
                $("#verify-warning").removeClass("alert-success");
                $("#verify-warning").addClass("alert-danger");
            }
            $("#verify-warning").text(data);
        });
    }
    render() {
        return (
            <div>
              <div className="alert alert-warning mt-1">
                Please verify your email {this.props.federationEmail} to activate Federation account.
                <br></br>
                <button onClick={ () => this.resendEmail() } className="btn btn-brown mt-1" id="resend-confirmation-email-btn">
                  Resend Verification Email
                </button>
              </div>
            </div>
        );
    }
}
// ========================================
const node = document.getElementById('portfolio-card');
const federation = JSON.parse(node.getAttribute('data-federation'));
ReactDOM.render(
    <VerifyEmailBtn federationEmail={federation.split('*')[0]}/>,
   document.getElementById('verify-warning'),
);
