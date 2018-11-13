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
    }
    render() {
        return (
            <div>
              <div className="form-group">
                <div className="form-label">
                  Recipients Public Key OR Federation Address
                </div>
                <input className="form-control" id="target-account" name="address" placeholder="Recipient's public key or Federation address" required="" type="text"/>
                <span className="text-danger mt-1" id="resolve-fed-address">
                  Resolving Federation Address...
                </span>
              </div>
              <div className="form-group">
                <div className="form-label">
                  Asset Type
                  <select name="asset_name" id="asset-type" className="form-control">
                    {this.props.assets.map((x, y)=><option key={y}>{x}</option>)};
                  </select>
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
