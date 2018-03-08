// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery3
//= require jquery_ujs
//= require jquery-ui
//= require components
//= require turbolinks
//= require popper
//= require bootstrap
//= require chartjs/Chart.min.js
//= require iCheck/icheck.min.js
//= require pace.min
//= require_tree .

$(document).ready(function() {

});

function progressbar() {    
  $("#progressbar").progressbar({
    value: false
  });

  var progressbar = $("#progressbar")
  var progressbarValue = progressbar.find( ".ui-progressbar-value" )
  progressbar.progressbar( "option", "value", false )
  // progressbarValue.css({"background": "#1ab394"})
  progressbarValue.css({"background": "#00bfff"})
  $("#progressbar").show()
}

function send_money() {
  // var server = new StellarSdk.Server('https://horizon-testnet.stellar.org')
  var server = new StellarSdk.Server('https://horizon.stellar.org')

  StellarSdk.Network.usePublicNetwork()
  // StellarSdk.Network.useTestNetwork()

  var sourceSecretKey = document.getElementById('secret-seed').value

  var receiverPublicKey = document.getElementById('target-account').value

  var amount = document.getElementById('amount-to-send').value

  var memo_type = $("input[name=memotype]:checked").val()

  var memo = document.getElementById('memo').value

  var asset_tag = document.getElementById('asset-type')

  var asset = asset_tag.options[asset_tag.selectedIndex].text

  if (asset == "Lumens") {
    asset = StellarSdk.Asset.native()
  } else {
    var asset_arr = asset.split(',')

    var asset_code = asset_arr[0].replace(/\s/g,'')

    var asset_issuer = asset_arr[1].replace(/\s/g,'')

    asset = new StellarSdk.Asset(asset_code, asset_issuer)
  }

  if (sourceSecretKey.length == 0 || receiverPublicKey.length == 0 || amount.length == 0) {
    $("#layout-alert").show()

    $("#layout-alert").html("Please Enter All Details.")
  } else {
    $("#layout-alert").hide()

    // Derive Keypair object and public key (that starts with a G) from the secret
    var sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecretKey)

    var sourcePublicKey = sourceKeypair.publicKey()

    var set_memo = StellarSdk.Memo.text(memo)

    if (memo_type == 'id') {
      set_memo = StellarSdk.Memo.id(memo)
    } else if (memo_type == 'hash') {
      set_memo = StellarSdk.Memo.hash(memo)
    } else if (memo_type == 'return') {
      set_memo = StellarSdk.Memo.return(memo)
    } else {
      set_memo = StellarSdk.Memo.text(memo)
    }

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
           amount: amount,
         })) // TODO Memo
         .addMemo(set_memo)
         // .addMemo(StellarSdk.Memo.text('Hello world!'))
         .build()

       // Sign this transaction with the secret key
       console.log("signing")
       transaction.sign(sourceKeypair)

       server.submitTransaction(transaction)
         .then(function(transactionResult) {
           // console.log(JSON.stringify(transactionResult, null, 2))
           // console.log('\nSuccess! View the transaction at: ')
           // console.log(transactionResult._links.transaction.href)
           var message = 'Amount ' + amount + ' transferred to ' + receiverPublicKey + ' successfully.'
           document.location.href = '/success?transaction_url=' + transactionResult._links.transaction.href + '&message=' + message
         })
         .catch(function(err) {
           console.log('An error has occured:')
           console.log(err)

           var result_code = err.data.extras.result_codes.operations[0]
           console.log(result_code)

           if (result_code == 'op_no_destination') {
             //fund_new_account(sourcePublicKey, receiverPublicKey, amount)
           } else if (result_code == 'op_no_trust') {
             document.location.href = '/trust_asset?failed=true&address='+ receiverPublicKey + '&asset_code=' + asset_code + '&asset_issuer=' + asset_issuer
           } else {
             // document.location.href = '/failed?error_description=' + result_code
           }
         })
     })
     .catch(function(e) {
       console.log(e.message.detail)
       console.error(e)
       document.location.href = '/failed?error_description=' + e.message.detail
     })
  }
} // send money function end

// fund new account block start
//var server = new StellarSdk.Server('https://horizon-testnet.stellar.org')

  function submit_transaction(server, transaction, target_account, amount) {    
    server.submitTransaction(transaction)
      .then(function(transactionResult) {
        // console.log(JSON.stringify(transactionResult, null, 2))
        // console.log('\nSuccess! View the transaction at: ')
        //console.log(transactionResult._links.transaction.href)
        document.location.href = '/success?transaction_url=' + transactionResult._links.transaction.href + '&message=New Account with adderess </br>' + target_account + ', Funded with amount ' + amount + ' and Activated.'
      })
      .catch(function(err) {
        console.log('An error has occured:')
        console.log(err)
        document.location.href = '/failed?error_description=' + err.message
      })
  }
  
  function build_transaction(secretString, sourcePublicKey, sequence, target_account, amount) {

    var account = new StellarSdk.Account(sourcePublicKey, sequence)

    var transaction = new StellarSdk.TransactionBuilder(account)
      .addOperation(StellarSdk.Operation.createAccount({
        destination: target_account,
        startingBalance: amount
      }))
      .build()

    transaction.sign(StellarSdk.Keypair.fromSecret(secretString))
    return transaction
  }

function fund_new_account() {
    // var server = new StellarSdk.Server('https://horizon-testnet.stellar.org')
    var server = new StellarSdk.Server('https://horizon.stellar.org')

    StellarSdk.Network.usePublicNetwork()
    // StellarSdk.Network.useTestNetwork()

    var secretString = document.getElementById('secret-seed').value
    var sourceKeypair = StellarSdk.Keypair.fromSecret(secretString)
    var sourcePublicKey = sourceKeypair.publicKey()
    var target_account = document.getElementById('target-account').value
    var amount = document.getElementById('amount-to-send').value
    
    server.accounts()
      .accountId(sourcePublicKey)
      .call()
      .then(function(accountResult) {
        var transaction = build_transaction(secretString, sourcePublicKey, accountResult.sequence, target_account, amount)
        submit_transaction(server, transaction, target_account, amount)
      })
      .catch(function (err) {
        console.log(err)
        document.location.href = '/failed?error_description=' + err.message.detail
      })
}
// fund new account block end