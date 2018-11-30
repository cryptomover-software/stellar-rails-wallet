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

export const scrollToDiv = function (div) {
    var scrollPos = $(div).offset().top;
    $(window).scrollTop(scrollPos);
};

var successMessages = {
    'changeThreshold': ' Threshold changed successfully.',
    'addSigner': 'New signer added successfully.',
    'removeSigner': 'Signer removed successfully.',
    'signAndSubmitTrx': 'Transaction Signed and Submitted to Stellar Network Successfully.'
};

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
             message += 'Invalid Private Seed.';
         } else if (resultCode == 'tx_bad_auth_extra') {
             message += 'This transaction object already has enough signatures. Do not sign it. Submit it without signing.';
         } else {
             message += resultCode;
         }
         $.post('/create_log', {message: '--> ERROR! Code: ' + resultCode + ' Full Error ' + err});
         document.location.href = '/failed?error_description=' + message;
     });
};
// Trust Assets
export const createTrustTransaction = function(limit, account, asset) {
  if (limit.length > 0) {
    return new StellarSdk.TransactionBuilder(account)
    .addOperation(StellarSdk.Operation.changeTrust({
      asset: asset,
      limit: limit
    })).build();
  } else {
    return new StellarSdk.TransactionBuilder(account)
    .addOperation(StellarSdk.Operation.changeTrust({
      asset: asset
    })).build();
  }
};
export const trustAssets = function (assetCode, assetIssuer, limit, sourcePublicKey, sourceSecretKey){
  try {
      var server = new StellarSdk.Server('https://horizon.stellar.org');
      var asset = new StellarSdk.Asset(assetCode, assetIssuer);
      var sourceKeyPair = StellarSdk.Keypair.fromSecret(sourceSecretKey);
      var message = '';
      if (limit != 0) {
          message = 'Asset ' + assetCode + ' trusted successfully in account ' + sourcePublicKey;
      } else {
          message = 'Asset ' + assetCode + ' removed successfully from account ' + sourcePublicKey;
      }

      StellarSdk.Network.usePublicNetwork();
      server.loadAccount(sourcePublicKey)
          .then(function(account){
              var transaction = createTrustTransaction(limit, account, asset);
              transaction.sign(sourceKeyPair);
              server.submitTransaction(transaction)
                  .then(function(result){
                      var link = result['_links']['transaction']['href'];
                      $.post('/create_log', {message: '--> SUCCESS! ' + message});
                      document.location.href = '/success?transaction_url=' + link + '&message=' + message;
                      // Update our balances again.
                      $.ajax({
                          url: "/get_balances"
                      });
                  })
                  .catch(function(err) {
                      if (err.data.extras.result_codes.operations[0] == "op_low_reserve") {
                          var message = 'Low Base Reserve in account ' + sourcePublicKey + '. Visit https://www.stellar.org/developers/guides/concepts/fees.html for more details.';
                          $.post('/create_log', {message: '--> ERROR! ' + message});
                          document.location.href = '/failed?error_description=' + message;
                      } else {
                          $.post('/create_log', {message: '--> ERROR! ' + err});
                          document.location.href = '/failed?error_description=' + err;
                      }
                  });
          })
          .catch(function(error){
              $.post('/create_log', {message: '--> ERROR! ' + error});
              document.location.href = '/failed?error_description=' + error;
          });
  } catch(error) {
      $.post('/create_log', {message: '--> ERROR! ' + error.message});
      document.location.href = '/failed?error_description=' + error.message;
  }
};
// end trust asset

// append data to table
export const appendDataToTable = function (balances) {
    var old_tbody = document.getElementById("balances-tbl").tBodies[0];
    var new_tbody = document.createElement('tbody');
    var row = "";
    var usd_price = '';

    if(balances.length == 1) {
        // special case of only one asset in account
        usd_price = 'Calculating';
        if ('usd_price' in balances[0]) {
            usd_price = numeral(balances[0]["usd_price"]).format('$0,0.00');
        }
        row = $("<tr><td>Lumens</td><td>--</td><td>" + balances[0]["balance"] +
                "</td><td>" + usd_price + "</td></tr>");
        $(new_tbody).append(row);
    } else {
        // second case of multiple assets in accounts
        for(var i=0;i < balances.length;i++) {
            usd_price = '';
            if (balances[i]["asset_type"] == "native") {
                usd_price = 'Calculating';
                if ('usd_price' in balances[i]) {
                    usd_price = numeral(balances[i]["usd_price"]).format('$0,0.00');
                }
                row = $("<tr><td>Lumens</td><td>--</td><td>" +
                        balances[i]["balance"] + "</td><td>" + usd_price +
                        "</td></tr>");
            } else {
                usd_price = 'Calculating';
                if ('usd_price' in balances[i]) {
                    usd_price = numeral(balances[i]["usd_price"]).format('$0,0.00');
                }
                row = $("<tr><td>" + balances[i]["asset_code"] +
                        "</td><td class='short-address'>" +
                        balances[i]["asset_issuer"] + "</td><td>" +
                        balances[i]["balance"] + "</td><td>" + usd_price +
                        "</td></tr>");
            }
            $(new_tbody).append(row);
        }
    }
    old_tbody.parentNode.replaceChild(new_tbody, old_tbody);
};
// end append data to table
function buildTransaction(sourceSecretKey, sourcePublicKey, sequence, receiverPublicKey, amount, memo, createTrx, self) {
    var account = new StellarSdk.Account(sourcePublicKey, sequence);

  var transaction = new StellarSdk.TransactionBuilder(account)
    .addOperation(StellarSdk.Operation.createAccount({
      destination: receiverPublicKey,
      startingBalance: amount
    }))
    .addMemo(memo)
      .build();

    if (createTrx) {
        if (self.state.sign) {
            transaction.sign(StellarSdk.Keypair.fromSecret(sourceSecretKey));
        }
    } else {
        transaction.sign(StellarSdk.Keypair.fromSecret(sourceSecretKey));
    }
    return transaction;
} // buildTransaction end

// check memo size
function checkMemoSize(memo, memoType) {
    var setMemo = "Memo";
    var memoData = [];

  try {
    if (memoType == 'id') {
        setMemo = StellarSdk.Memo.id(memo);
    } else if (memoType == 'hash') {
        setMemo = StellarSdk.Memo.hash(memo);
    } else if (memoType == 'return') {
        setMemo = StellarSdk.Memo.return(memo);
    } else {
        setMemo = StellarSdk.Memo.text(memo);
    }
      memoData = [false, setMemo];
  } catch(error) {
    // console.log(error)
      memoData = [true, error.message];
  }
    return memoData;
}
// amount limit
function amountNotWithinLimit(amount) {
    var balance = $("#available-balance").text().split(" ")[0];
    if (parseFloat(amount) <= parseFloat(balance)) {
        // Amount entered by user is within balance limit.
        return false;
    } else {
        // Amount entered by user is NOT within balance limit.
        return true;
    }
}
// inform user that this account does not exist yet
// and that he needs to fund it first
function alertFundNewAccount() {
    $("#progressbar").hide();

    $("#secret-seed").prop("disabled", false);
    $("#target-account").prop("disabled", false);
    $("#amount-to-send").prop("disabled", false);
    $("#asset-type").prop("disabled", false);
    $("input[name=memotype]").removeAttr("disabled");
    $("input[name=fund-new]").removeAttr("disabled");
    $("#memo").prop("disabled", false);
    $("#send_money").prop("disabled", false);
    $('#create-send-money-trx').prop("disabled", false);
    $('#send-max').prop("disabled", false);
    $("#cancel-btn").prop("disabled", false);

    $("#layout-alert").show();
    $("#layout-alert").html("Target account is not active Yet. Select Fund New Account option to activate it by sending 1 XLM.");
    var scrollPos = $('#layout-alert').offset().top;
    $(window).scrollTop(scrollPos);
}
// transfer to existing active account
function sendMoney(server, sourceSecretKey, receiverPublicKey, amount, memoType, memo, asset, createTrx, self) {
    // Derive Keypair object and public key (that starts with a G) from the secret
    var sourceKeyPair = StellarSdk.Keypair.fromSecret(sourceSecretKey);

    var sourcePublicKey = sourceKeyPair.publicKey();

    server.loadAccount(sourcePublicKey)
        .then(function(account) {
            var transaction = new StellarSdk.TransactionBuilder(account)
            // Add a payment operation to the transaction
                .addOperation(StellarSdk.Operation.payment({
                    destination: receiverPublicKey,
                    // The term native asset refers to lumens
                    // asset: StellarSdk.Asset.native(),
                    asset: asset,
                    // Lumens are divisible to seven digits past the decimal.
                    // They are represented in JS Stellar SDK in string format
                    amount: amount
                }))
                .addMemo(memo)
                .build();

            if (createTrx) {
                // just create trx object and display it.
                if (self.state.sign) {
                    transaction.sign(sourceKeyPair);
                }
                var xdr = transaction.toEnvelope().toXDR('base64');
                document.getElementById('ct-send-assets').innerHTML = "Transaction Object: <br>" + xdr;
                $('#progressbar').hide();
            } else {
                // Submit transaction to network.
                // Sign this transaction with the secret key
                transaction.sign(sourceKeyPair);
                server.submitTransaction(transaction)
                    .then(function(transactionResult) {
                        // console.log(JSON.stringify(transactionResult, null, 2))
                        // console.log('\nSuccess! View the transaction at: ')
                        // console.log(transactionResult._links.transaction.href)
                        var transactionURL = transactionResult._links.transaction.href;
                        var message = 'Amount ' + amount + ' ' + asset.code + ' transferred to ' + receiverPublicKey + ' successfully.';
                        $.post('/create_log', {message: '--> ' + message});
                        document.location.href = '/success?transaction_url=' + transactionURL + '&message=' + message;
                        // update our balances data again
                        $.ajax({
                            url: "/get_balances"
                        });
                    })
                    .catch(function(err) {
                        // console.log('An error has occured:')
                        // console.log(err)
                        var resultCode = err.data.extras.result_codes.operations[0];
                        $.post('/create_log', {message: '--> ERROR! Code: ' + resultCode + ' Full Error ' + err});
                        var message = '';
                        if (resultCode == 'op_no_destination') {
                            alertFundNewAccount();
                        } else if (resultCode == 'op_underfunded') {
                            message = "You do not have enough balance.";
                            document.location.href = '/failed?error_description=' + message;
                        } else if (resultCode == 'op_no_trust') {
                            message = "The target address " + receiverPublicKey + " do not trust asset " + asset.code + ".";
                            document.location.href = '/failed?error_description=' + message;
                        } else {
                            document.location.href = '/failed?error_description=' + "Unkown Error. Please Check Network Connection.";
                        }
                    }); // submit transaction end
            }
        })
        .catch(function(e) {
            // console.log(e.message.detail)
            // console.error(e)
            if (e.message.detail == undefined) {
                $.post('/create_log', {message: '--> ERROR! ' + e});
                document.location.href = '/failed?error_description=' + e;
            } else {
                $.post('/create_log', {message: '--> ERROR! ' + e.message.detail});
                document.location.href = '/failed?error_description=' + e.message.detail;
            }
        }); // load account end
} // send money function end

// check if account is already funded or not
function alreadyFunded(server, sourceSecretKey, receiverPublicKey, amount, memoType, memo, asset, createTrx, self) {
  server.accounts()
    .accountId(receiverPublicKey)
    .call()
    .then(function(accountResult) {
        var message = "Account is Already Active. Account Address: " + receiverPublicKey;
        $.post('/create_log', {message: '--> ERROR! ' + message});
        document.location.href = '/failed?error_description=' + message;
        return;
    }).catch(function (err) {
      // statusCode = err["message"]["status"]
        $.post('/create_log', {message: '--> Funding New Account Began for' + receiverPublicKey});
        fundNewAccount(server, sourceSecretKey, receiverPublicKey, amount, memoType, memo, asset, createTrx, self);
    });
} // alreadyFunded end

function fundNewAccount(server, sourceSecretKey, receiverPublicKey, amount, memoType, memo, asset, createTrx, self) {
    var sourceKeyPair = StellarSdk.Keypair.fromSecret(sourceSecretKey);
    var sourcePublicKey = sourceKeyPair.publicKey();

    server.accounts()
      .accountId(sourcePublicKey)
      .call()
        .then(function(accountResult) {
            var transaction = buildTransaction(sourceSecretKey, sourcePublicKey, accountResult.sequence, receiverPublicKey, amount, memo, createTrx, self);
            if (createTrx) {
                var xdr = transaction.toEnvelope().toXDR('base64');
                document.getElementById('ct-send-assets').innerHTML = "Transaction Object: <br>" + xdr;
                $('#progressbar').hide();
            } else {
                server.submitTransaction(transaction)
                    .then(function(transactionResult) {
                        // console.log(JSON.stringify(transactionResult, null, 2))
                        // console.log('\nSuccess! View the transaction at: ')
                        //console.log(transactionResult._links.transaction.href)
                        var transactionURL = transactionResult._links.transaction.href;
                        var message = 'New Account with adderess ' + receiverPublicKey + ', Funded with amount ' + amount + ' and Activated.';
                        $.post('/create_log', {message: '--> SUCCESS! ' + message});
                        document.location.href = '/success?transaction_url=' + transactionURL + '&message=' + message;
                        $.ajax({
                            url: "/get_balances"
                        });
                    })
                    .catch(function(err) {
                        // console.log('An error has occured:')
                        // console.log(err)
                        $.post('/create_log', {message: '--> ERROR! ' + err.message});
                        document.location.href = '/failed?error_description=' + err.message;
                    });
            }
        })
      .catch(function (err) {
        // console.log(err)
          $.post('/create_log', {message: '--> ERROR! ' + err.message.detail});
          document.location.href = '/failed?error_description=' + err.message.detail;
      });
} // fund new account block end

// process transfer
export const processTransfer = function (fundAccount, receiverPublicKey, federationAddress, createTrx, self) {
    try {
        // var server = new StellarSdk.Server('https://horizon-testnet.stellar.org')
        var server = new StellarSdk.Server('https://horizon.stellar.org');
        StellarSdk.Network.usePublicNetwork();
        // StellarSdk.Network.useTestNetwork()
        var sourceSecretKey = document.getElementById('secret-seed').value.replace(/\s/g,'');
        // var receiverPublicKey = document.getElementById('target-account').value.replace(/\s/g,'');
        var amount = document.getElementById('amount-to-send').value.replace(/\s/g,'');
        var memoType = $("input[name=memotype]:checked").val();
        var memoInput = document.getElementById('memo').value;
        var memoData = checkMemoSize(memoInput, memoType);
        var memo = memoData[1];
        var memoSizeExceedsLimit = memoData[0];

        var assetTag = document.getElementById('asset-type');
        var asset = assetTag.options[assetTag.selectedIndex].text;

        if (asset == "Lumens") {
            asset = StellarSdk.Asset.native();
        } else {
            var assetArr = asset.split(',');
            var assetCode = assetArr[0].replace(/\s/g,'');
            var assetIssuer = assetArr[1].replace(/\s/g,'');
            asset = new StellarSdk.Asset(assetCode, assetIssuer);
        }
        var scrollPos = '';
        if (sourceSecretKey.length == 0 || receiverPublicKey.length == 0 || amount.length == 0) {
            ("#layout-alert").show();
            $("#layout-alert").html("Please Enter All Details.");
            scrollPos = $('#layout-alert').offset().top;
            $(window).scrollTop(scrollPos);
            return;
        } else if (amountNotWithinLimit(amount)) {
            $("#layout-alert").show();
            $("#layout-alert").html("Amount you entered exceeds your balance.");
            scrollPos = $('#layout-alert').offset().top;
            $(window).scrollTop(scrollPos);
            return;
        } else if (memoSizeExceedsLimit) {
            $("#layout-alert").show();
            $("#layout-alert").html("Memo Error: " + memo);
            scrollPos = $('#layout-alert').offset().top;
            $(window).scrollTop(scrollPos);
            return;
        } else {
            $("#layout-alert").hide();
            // hideFormControls();
            // this.setState({disabled: true});
            progressBar();
            if (fundAccount) {
                // first check if account is already funded
                // or not before begining fundNewAccount
                alreadyFunded(server, sourceSecretKey, receiverPublicKey, amount, memoType, memo, asset, createTrx, self);
            } else {
                $.post('/create_log', {message: '--> Sending asset(s) to existing account ' + receiverPublicKey});
                sendMoney(server, sourceSecretKey, receiverPublicKey, amount, memoType, memo, asset, createTrx, self);
            }
        }
    } catch(error) {
        // console.log(error.message)
        $.post('/create_log', {message: '--> ERROR! Wrong input in Asset Transfer form.'});
        document.location.href = '/failed?error_description=Wrong Input. Please enter Correct Target Account Address, Correct Private Key and other details. Error Message: ' + error.message;
    }
};
// end process transfer
// API to get transaction history and assets.
export const historyAndAssetsAPI = function(url, self) {
    fetch(url)
        .then(res => res.json())
        .then(
            (result) => {
                self.setState({
                    data: result['_embedded']['records'],
                    next: result['_links']['next']['href'],
                    prev: result['_links']['prev']['href']
                });
                $('#progressbar').hide();
            },
            (error) => {
                self.setState({
                    errors: error
                });
            }
        );
};
