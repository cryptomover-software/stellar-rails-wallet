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
var successMessages = {'changeThreshold': ' Threshold changed successfully.'};
var errorMessages = {'changeThreshold': 'Invalid Private Seed.'};

export const progressBar = function () {
    $("#progressbar").progressbar({
      value: false
    });

    var progressBar = $("#progressbar");
    var progressBarValue = progressBar.find(".ui-progressbar-value");
    progressBar.progressbar( "option", "value", false );
    progressBarValue.css({"background": "#00bfff"});
    $("#progressbar").show();
    // $("#progressbar").focus()
    var scrollPos =  $("#progressbar").offset().top;
    $(window).scrollTop(scrollPos);
};

export const submitTransaction = function (transaction, server, trxType) {
    StellarSdk.Network.usePublicNetwork();
    server.submitTransaction(transaction)
        .then(function(transactionResult) {
            // console.log(JSON.stringify(transactionResult, null, 2));
            // console.log('\nSuccess! View the transaction at: ');
            // console.log(transactionResult._links.transaction.href);
            var transactionURL = transactionResult._links.transaction.href;
            var message = successMessages[trxType];
            $.post('/create_log', {message: '--> ' + message});
            document.location.href = '/success?transaction_url=' + transactionURL + '&message=' + message;
     })
     .catch(function(err) {
         var resultCode = err.data.extras.result_codes.transaction;
         // console.log(err);
         // console.log(resultCode);
         var message = '';
         if (resultCode == 'tx_bad_auth') {
             message += errorMessages[trxType];
         }
         $.post('/create_log', {message: '--> ERROR! Code: ' + resultCode + ' Full Error ' + err});
         document.location.href = '/failed?error_description=' + message;
     });
};
