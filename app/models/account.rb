class Account < ApplicationRecord

  validates :email, :uniqueness => true, :format => /\A[^@\s]+@[^@\s]+\z/


  def self.create_account
   # "python3 /Users/meizu01/Downloads/Stellar_token_issuer.py"

    pair = Stellar::KeyPair.from_seed("SAFZ4JAMYXLYHIDR2YNJ3XRAGBWOMMDXYAO7UWNKOHOREKFNDXYQI6NJ")
    #master      = Stellar::KeyPair.from_address("GDNRWBDBEGMO7BSVOJ5DFLWXRUZDMTABUKBN6LRWJRREKYEFAOXEFZN2")
    destination = Stellar::KeyPair.random

    url = "https://horizon.stellar.org/accounts/GDNRWBDBEGMO7BSVOJ5DFLWXRUZDMTABUKBN6LRWJRREKYEFAOXEFZN2"
    response = HTTParty.get(url)
    body = JSON.parse(response.body)
    sequence = body['sequence']

    tx = Stellar::Transaction.create_account({
      account:     pair,
      destination: destination,
      sequence:    sequence.to_i,
      starting_balance:  20
    })
#des GBXZJUQEQ6C5HLSMDGYDMQGAQYZRF3AGSGCXFWWYK5BRLW2DO4U3H4TW

#     Hash:
# d5fb022b0999d0e3083215292ff3cc9277f0d256482a87604ae0fb00015369b4
# XDR:
# AAAAANsbBGEhmO+GVXJ6Mq7XjTI2TAGigt8uNkxiRWCFA65CAAAAZADQoXcAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAb5TSBIeF065MGbA2QMCGMxLsBpGFctrYV0MV20N3KbMAAAAAAJiWgAAAAAAAAAAA

    b64    = tx.to_envelope(pair).to_xdr(:base64)
    p b64
    result = HTTParty.post('https://horizon.stellar.org/transactions/', body: {tx: b64})
    #get('tx', blob: b64)
    p result.body
  end



end


# curl -X POST \
#      -F "tx=AAAAANsbBGEhmO+GVXJ6Mq7XjTI2TAGigt8uNkxiRWCFA65CAAAAZADQoXcAAAABAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAHk3hfIqHYMUrb+UvlZl6sxaYqzCveN4ORWe6+B1cw4cAAAAAAJiWgAAAAAAAAAABhQOuQgAAAED4Swm2s4sHID1teiEsR00q+usPcFPe/J6bkYEaWRlApl79MUiAFLABpDaAu7BPOGlws3+iXmGM/P++8/2sL+MH" \
#   "https://horizon.stellar.org/transactions"
