"""
Created on Wed Jul  5 22:49:48 2017

@author: fanbingxia
"""

#%%
import requests
from stellar_base.address import Address
from stellar_base.operation import ChangeTrust
from stellar_base.asset import Asset
from stellar_base.horizon import horizon_livenet
from stellar_base.transaction_envelope import TransactionEnvelope as Te
from stellar_base.transaction import Transaction
from stellar_base.keypair import Keypair
from stellar_base.operation import Payment
horizon = horizon_livenet()

#%%   Create an account (Do not execute again to avoid rewriting of kp3)
#CMIssuer = Keypair.random()
#CMIssuer_Add = CMIssuer.address().decode()
#CMIssuer_Seed = CMIssuer.seed().decode()
#CMDistributor = Keypair.random()
#CMDistributor_Add = CMDistributor.address().decode()
#CMDistributor_Seed = CMDistributor.seed().decode()


#%%   Pass or not
def passed_or_not(response):
    if '_links' in response:
        print('Transaction passed')
        return True
    else:
        print('Transaction failed')
        return False

#%%
def asset_Identifier(assetName, assetAdd):
    if assetName=='XLM':
        asset = Asset('XLM')
    else:
        asset = Asset(assetName,assetAdd)
    return asset

#%%   Account Information checking and achieve keypair form seed
def Account_info_update(Add):

    add_info = Address(address = Add,network = 'public')
    add_info.get()
    return add_info

#%%    Create an account

def Account_creation(IssuerAdd,IssuerSeed,XLMamount):
    from stellar_base.operation import CreateAccount
    NewKP = Keypair.random()
    NewAdd = NewKP.address().decode()
    sequence = horizon.account(IssuerAdd).get('sequence')
    op = CreateAccount({'destination':NewAdd,'starting_balance':str(XLMamount)})
    tx = Transaction(source=IssuerAdd,opts={'sequence':sequence,'operations':[op]})
    envelope = Te(tx=tx,opts={"network_id":"PUBLIC"})
    kp = Keypair.from_seed(IssuerSeed)
    envelope.sign(kp)
    xdr = envelope.xdr()
    response = horizon.submit(xdr)
    result = passed_or_not(response)
    return NewKP


#%% Fund a new account
def Fund_new_account(newAdd, IssuerAdd, IssuerSeed,XLMamount):
    from stellar_base.operation import CreateAccount
    sequence = horizon.account(IssuerAdd).get('sequence')
    op = CreateAccount({'destination':newAdd,'starting_balance':str(XLMamount)})
    tx = Transaction(source=IssuerAdd,opts={'sequence':sequence,'operations':[op]})
    envelope = Te(tx=tx,opts={"network_id":"PUBLIC"})
    kp = Keypair.from_seed(IssuerSeed)
    envelope.sign(kp)
    xdr = envelope.xdr()
    response = horizon.submit(xdr)
    result = passed_or_not(response)
    return response


#%% Send Lumens
def Sending_lumen(sourceAdd,sourceSeed,desAdd,amount):
    asset = Asset('XLM')
    sequence = horizon.account(sourceAdd).get('sequence')
    op = Payment({'asset':asset,'amount':str(amount),'destination':desAdd})
    tx = Transaction(source=sourceAdd,opts={'sequence':sequence,'operations':[op]})
    envelope_send = Te(tx = tx,opts = {"network_id":"PUBLIC"})
    kp = Keypair.from_seed(sourceSeed)
    envelope_send.sign(kp)
    xdr = envelope_send.xdr()
    response = horizon.submit(xdr)
    result = passed_or_not(response)
    return response

#%% changetrust operation
def Trusting_asset(assetName,issuerAdd,truster,trusterSeed,limit):
    asset = Asset(assetName,issuerAdd)
    sequence2 = horizon.account(truster).get('sequence')
    op_ct = ChangeTrust({'asset':asset, 'limit':str(limit)})
    tx_ct = Transaction(source=truster, opts = {'sequence':sequence2, 'operations':[op_ct,]})
    envelope_ct = Te(tx=tx_ct, opts={"network_id": "PUBLIC"})
    kp = Keypair.from_seed(trusterSeed)
    envelope_ct.sign(kp)                 #sign
    xdr2 = envelope_ct.xdr()
    response=horizon.submit(xdr2)           #submit
    result = passed_or_not(response)
    return response

#%%   Issue CMtest_1
def Issuing_asset(assetName,issuerAdd,issuerSeed,desAdd,amount):
    asset = Asset(assetName,issuerAdd)
    sequence1 = horizon.account(issuerAdd).get('sequence')
    op_pay = Payment({'asset':asset, 'amount':str(amount), 'destination':desAdd})
    tx_pay = Transaction(source=issuerAdd, opts = {'sequence':sequence1, 'operations':[op_pay,]})
    envelope_pay = Te(tx=tx_pay, opts={"network_id": "PUBLIC"})
    kp = Keypair.from_seed(issuerSeed)
    envelope_pay.sign(kp)
    xdr1 = envelope_pay.xdr()
    response=horizon.submit(xdr1)
    result = passed_or_not(response)
    return response


#%%   Seeding asset from an non-issuer
def Sending_asset(assetName,issuerAdd,sourceAdd,sourceSeed,desAdd,amount):
    asset = Asset(assetName,issuerAdd)
    sequence1 = horizon.account(sourceAdd).get('sequence')
    op_pay = Payment({'asset':asset, 'amount':str(amount), 'destination':desAdd})
    tx_pay = Transaction(source=sourceAdd, opts = {'sequence':sequence1, 'operations':[op_pay,]})
    envelope_pay = Te(tx=tx_pay, opts={"network_id": "PUBLIC"})
    kp = Keypair.from_seed(sourceSeed)
    envelope_pay.sign(kp)
    xdr1 = envelope_pay.xdr()
    response=horizon.submit(xdr1)
    result = passed_or_not(response)
    return response


#Sending_asset("CM3", "GA4BYMUO5D7OLGVJWZ2D5FCWU7SB63FNZ4QUU574SMNA6ELK5TZD3SO3", "GDNRWBDBEGMO7BSVOJ5DFLWXRUZDMTABUKBN6LRWJRREKYEFAOXEFZN2", "SAFZ4JAMYXLYHIDR2YNJ3XRAGBWOMMDXYAO7UWNKOHOREKFNDXYQI6NJ", "GCW6OA2Q5BCBPN3R75SRADQMAMMHLOAXT2QRX7KSR76GAF4BFK32T6PH", 1)
#%%    Creat sell order
def Place_sell_order(sellAsset,sellAssetIssuer,amount,offerID,price,sourceAdd,sourceSeed):
    from stellar_base.operation import ManageOffer
    sequence3 = horizon.account(sourceAdd).get('sequence')
    assetSell = asset_Identifier(sellAsset,sellAssetIssuer)
    assetBuy = Asset('XLM')
    op_so = ManageOffer({'selling':assetSell, 'buying':assetBuy, 'amount':str(amount), 'price':str(price),'offer_id':offerID})
    tx_so = Transaction(source = sourceAdd,opts = {'sequence':sequence3,'operations':[op_so]})
    envelope_so = Te(tx=tx_so,opts={"network_id":"PUBLIC"})
    kp = Keypair.from_seed(sourceSeed)
    envelope_so.sign(kp)
    xdr3 = envelope_so.xdr()
    response = horizon.submit(xdr3)
    result = passed_or_not(response)
    return response['result_xdr']

def Place_buy_order(buyAsset,buyAssetIssuer,amount,offerID,price,sourceAdd,sourceSeed):
    #the amount here need to be the amount of xlm you want to sell, and the price need to be the price of xlm in terms of the asset you want to buy
    from stellar_base.operation import ManageOffer
    sequence3 = horizon.account(sourceAdd).get('sequence')
    assetBuy = asset_Identifier(buyAsset,buyAssetIssuer)
    assetSell = Asset('XLM')
    op_so = ManageOffer({'selling':assetSell, 'buying':assetBuy, 'amount':str(amount), 'price':str(price),'offer_id':offerID})
    tx_so = Transaction(source = sourceAdd,opts = {'sequence':sequence3,'operations':[op_so]})
    envelope_so = Te(tx=tx_so,opts={"network_id":"PUBLIC"})
    kp = Keypair.from_seed(sourceSeed)
    envelope_so.sign(kp)
    xdr3 = envelope_so.xdr()
    response = horizon.submit(xdr3)
    result = passed_or_not(response)
    return response['result_xdr']

#%%  Get offer ID
def Get_offer_ID(xdr_result):
    from stellar_base.stellarxdr import Xdr
    import base64
    xdr_decoded = base64.b64decode(xdr_result)
    te = Xdr.StellarXDRUnpacker(xdr_decoded)
    te_xdr_object = te.unpack_TransactionResult()
    return te_xdr_object.result.results[0].tr.manageOfferResult.success.offer.offer.offerID


def Cancel_sell_order(sellAsset,sellAssetIssuer,price,xdr_result,sourceAdd,sourceSeed):
    from stellar_base.operation import ManageOffer
    offerID = Get_offer_ID(xdr_result)
    sequence3 = horizon.account(sourceAdd).get('sequence')
    assetSell = asset_Identifier(sellAsset,sellAssetIssuer)
    assetBuy = Asset('XLM')
    op_so = ManageOffer({'selling':assetSell, 'buying':assetBuy, 'amount':str(0), 'price':str(price),'offer_id':offerID})        #How to get the ID of existing order
    tx_so = Transaction(source = sourceAdd,opts = {'sequence':sequence3,'operations':[op_so]})
    envelope_so = Te(tx=tx_so,opts={"network_id":"PUBLIC"})
    kp = Keypair.from_seed(sourceSeed)
    envelope_so.sign(kp)
    xdr3 = envelope_so.xdr()
    response = horizon.submit(xdr3)
    result = passed_or_not(response)
    return response['result_xdr']

def Cancel_buy_order(buyAsset,buyAssetIssuer,price,xdr_result,sourceAdd,sourceSeed):
    from stellar_base.operation import ManageOffer
    offerID = Get_offer_ID(xdr_result)
    sequence3 = horizon.account(sourceAdd).get('sequence')
    assetBuy = asset_Identifier(buyAsset,buyAssetIssuer)
    assetSell = Asset('XLM')
    op_so = ManageOffer({'selling':assetSell, 'buying':assetBuy, 'amount':str(0), 'price':str(price),'offer_id':offerID})        #How to get the ID of existing order
    tx_so = Transaction(source = sourceAdd,opts = {'sequence':sequence3,'operations':[op_so]})
    envelope_so = Te(tx=tx_so,opts={"network_id":"PUBLIC"})
    kp = Keypair.from_seed(sourceSeed)
    envelope_so.sign(kp)
    xdr3 = envelope_so.xdr()
    response = horizon.submit(xdr3)
    result = passed_or_not(response)
    return response['result_xdr']



# #!/usr/bin/env python3
# # -*- coding: utf-8 -*-
# """
# Created on Fri Jul 14 07:57:06 2017
#
# @author: fanbingxia
# """
#
# #!/usr/bin/env python3
# # -*- coding: utf-8 -*-
# """
# Created on Wed Jul  5 22:49:48 2017
#
# @author: fanbingxia
# """
#
# #%%
# import requests
# from stellar_base.address import Address
# from stellar_base.operation import ChangeTrust
# from stellar_base.asset import Asset
# from stellar_base.horizon import horizon_livenet
# from stellar_base.horizon import Horizon
# from stellar_base.transaction_envelope import TransactionEnvelope as Te
# from stellar_base.transaction import Transaction
# from stellar_base.keypair import Keypair
# from stellar_base.operation import Payment
# horizon = horizon_livenet()
# #horizon = Horizon('https://cryptodealer.hk')
#
#
#
# #%%
# # sourceAdd = '...'
# # sourceSeed = '...'
# # desAdd = '...'
# #%%   Create an account (Do not execute again to avoid rewriting of kp3)
# #CMIssuer = Keypair.random()
# #CMIssuer_Add = CMIssuer.address().decode()
# #CMIssuer_Seed = CMIssuer.seed().decode()
# #CMDistributor = Keypair.random()
# #CMDistributor_Add = CMDistributor.address().decode()
# #CMDistributor_Seed = CMDistributor.seed().decode()
#
#
# #%%   Pass or not
# def passed_or_not(response):
#     if '_links' in response:
#         print('Transaction passed')
#         return True
#     else:
#         print('Transaction failed')
#         return False
#
# #%%
# def asset_Identifier(assetName, assetAdd):
#     if assetName=='XLM':
#         asset = Asset('XLM')
#     else:
#         asset = Asset(assetName,assetAdd)
#     return asset
#
# #%%   Account Information checking and achieve keypair form seed
# def Account_info_update(Add):
#
#     add_info = Address(address = Add,network = 'public')
#     add_info.get()
#     return add_info
#
# #%%    Create an account
#
# def Account_creation(IssuerAdd,IssuerSeed,XLMamount):
#     from stellar_base.operation import CreateAccount
#     NewKP = Keypair.random()
#     NewAdd = NewKP.address().decode()
#     sequence = horizon.account(IssuerAdd).get('sequence')
#     op = CreateAccount({'destination':NewAdd,'starting_balance':str(XLMamount)})
#     tx = Transaction(source=IssuerAdd,opts={'sequence':sequence,'operations':[op]})
#     envelope = Te(tx=tx,opts={"network_id":"PUBLIC"})
#     kp = Keypair.from_seed(IssuerSeed)
#     envelope.sign(kp)
#     xdr = envelope.xdr()
#     response = horizon.submit(xdr)
#     result = passed_or_not(response)
#     print(xdr)
#     print(response)
#     return xdr
#
# #Account_creation("GDNRWBDBEGMO7BSVOJ5DFLWXRUZDMTABUKBN6LRWJRREKYEFAOXEFZN2", "SAFZ4JAMYXLYHIDR2YNJ3XRAGBWOMMDXYAO7UWNKOHOREKFNDXYQI6NJ", 2)
#
# #%% Send Lumens
# def Sending_lumen(sourceAdd,sourceSeed,desAdd,amount):
#     asset = Asset('XLM')
#     sequence = horizon.account(sourceAdd).get('sequence')
#     op = Payment({'asset':asset,'amount':str(amount),'destination':desAdd})
#     tx = Transaction(source=sourceAdd,opts={'sequence':sequence,'operations':[op]})
#     envelope_send = Te(tx = tx,opts = {"network_id":"PUBLIC"})
#     kp = Keypair.from_seed(sourceSeed)
#     envelope_send.sign(kp)
#     xdr = envelope_send.xdr()
#     xdr = xdr.decode()
#     response = horizon.submit(xdr)
#     result = passed_or_not(response)
#     return response
#
# #%% changetrust operation
# def Trusting_asset(assetName,issuerAdd,truster,trusterSeed,limit):
#     asset = Asset(assetName,issuerAdd)
#     sequence2 = horizon.account(truster).get('sequence')
#     op_ct = ChangeTrust({'asset':asset, 'limit':str(limit)})
#     tx_ct = Transaction(source=truster, opts = {'sequence':sequence2, 'operations':[op_ct,]})
#     envelope_ct = Te(tx=tx_ct, opts={"network_id": "PUBLIC"})
#     kp = Keypair.from_seed(trusterSeed)
#     envelope_ct.sign(kp)                 #sign
#     xdr2 = envelope_ct.xdr()
#     response=horizon.submit(xdr2)           #submit
#     result = passed_or_not(response)
#     return response
#
# #%%   Issue CMtest_1
# def Issuing_asset(assetName,issuerAdd,issuerSeed,desAdd,amount):
#     asset = asset_Identifier(assetName, issuerAdd)
#     #asset = Asset(assetName,issuerAdd)
#     sequence1 = horizon.account(issuerAdd).get('sequence')
#     op_pay = Payment({'asset':asset, 'amount':str(amount), 'destination':desAdd})
#     tx_pay = Transaction(source=issuerAdd, opts = {'sequence':sequence1, 'operations':[op_pay,]})
#     envelope_pay = Te(tx=tx_pay, opts={"network_id": "PUBLIC"})
#     kp = Keypair.from_seed(issuerSeed)
#     envelope_pay.sign(kp)
#     xdr1 = envelope_pay.xdr()
#     response=horizon.submit(xdr1)
#     result = passed_or_not(response)
#     print(response)
#     return response
#
# #Trusting_asset("CM3", "GA4BYMUO5D7OLGVJWZ2D5FCWU7SB63FNZ4QUU574SMNA6ELK5TZD3SO3", "GDNRWBDBEGMO7BSVOJ5DFLWXRUZDMTABUKBN6LRWJRREKYEFAOXEFZN2", "SAFZ4JAMYXLYHIDR2YNJ3XRAGBWOMMDXYAO7UWNKOHOREKFNDXYQI6NJ", 10000000)
# Issuing_asset("CM3", "GDNRWBDBEGMO7BSVOJ5DFLWXRUZDMTABUKBN6LRWJRREKYEFAOXEFZN2", "SAFZ4JAMYXLYHIDR2YNJ3XRAGBWOMMDXYAO7UWNKOHOREKFNDXYQI6NJ", "GCW6OA2Q5BCBPN3R75SRADQMAMMHLOAXT2QRX7KSR76GAF4BFK32T6PH", 1)
# #Issuing_asset("XLM", "GDNRWBDBEGMO7BSVOJ5DFLWXRUZDMTABUKBN6LRWJRREKYEFAOXEFZN2", "SAFZ4JAMYXLYHIDR2YNJ3XRAGBWOMMDXYAO7UWNKOHOREKFNDXYQI6NJ", "GCW6OA2Q5BCBPN3R75SRADQMAMMHLOAXT2QRX7KSR76GAF4BFK32T6PH", 3)
#
# #%%    Creat sell order
# def Place_sell_order(sellAsset,sellAssetIssuer,amount,offerID,price,sourceAdd,sourceSeed):
#     from stellar_base.operation import ManageOffer
#     sequence3 = horizon.account(sourceAdd).get('sequence')
#     assetSell = asset_Identifier(sellAsset,sellAssetIssuer)
#     assetBuy = Asset('XLM')
#     op_so = ManageOffer({'selling':assetSell, 'buying':assetBuy, 'amount':str(amount), 'price':str(price),'offer_id':offerID})        #How to get the ID of existing order
#     tx_so = Transaction(source = sourceAdd,opts = {'sequence':sequence3,'operations':[op_so]})
#     envelope_so = Te(tx=tx_so,opts={"network_id":"PUBLIC"})
#     kp = Keypair.from_seed(sourceSeed)
#     envelope_so.sign(kp)
#     xdr3 = envelope_so.xdr()
#     response = horizon.submit(xdr3)
#     result = passed_or_not(response)
#     return response['result_xdr']
#
# #%%  Get offer ID
# def Get_offer_ID(xdr_result):
#     from stellar_base.stellarxdr import Xdr
#     import base64
#     xdr_decoded = base64.b64decode(xdr_result)
#     te = Xdr.StellarXDRUnpacker(xdr_decoded)
#     te_xdr_object = te.unpack_TransactionResult()
#     return te_xdr_object.result.results[0].tr.manageOfferResult.success.offer.offer.offerID
#
#
# #%%
# def Get_latest_transaction(Add):
#     acc = Account_info_update(Add)
#     lst_pay = acc.payments(order='desc',limit=1)
#     if lst_pay['_embedded']['records'][0]['type']=='payment':
#         payer=lst_pay['_embedded']['records'][0]['from']
#         receiver = lst_pay['_embedded']['records'][0]['to']
#         amount = lst_pay['_embedded']['records'][0]['amount']
#         asset_type = lst_pay['_embedded']['records'][0]['asset_type']
#         if Add==receiver:
#             print("Received "+amount+asset_type+' from '+payer+'.')
#         elif Add==payer:
#             print("Sent "+amount+asset_type+' to '+receiver+'.')
#     else:
#         print('This is not a payment')
#     return True
#
#
#
# # #%%   Set security levels of a source account
# # from stellar_base.operation import SetOptions
# # sequence = horizon.account('GA4BYMUO5D7OLGVJWZ2D5FCWU7SB63FNZ4QUU574SMNA6ELK5TZD3SO3').get('sequence')
# # op_setoption = SetOptions({'master_weight':3,'med_threshold':2,
# #                            'high_threshold':3})
# # #op_setoption = SetOptions({'home_domain':'123'})
# # tx_setoption = Transaction(source='GA4BYMUO5D7OLGVJWZ2D5FCWU7SB63FNZ4QUU574SMNA6ELK5TZD3SO3',opts={'sequence':sequence,'operations':[op_setoption]})
# # envelope_setoption = Te(tx = tx_setoption,opts = {'network_id':'PUBLIC'})
# # kp = Keypair.from_seed('SA2JP7EB3JQTDXBTSHLUEDPODNVFXLPVX27O4WFQXHUREKJZA7OVCTWQ')
# # envelope_setoption.sign(kp)
# # xdr = envelope_setoption.xdr()
# # response5 = horizon.submit(xdr)
# # passed_or_not(response5)
# #
# #
# # #%%    Let Add1 sign the Payment from Add2
# # sequence = horizon.account(Add2).get('sequence')
# # lumen = Asset('XLM')
# # op_sendfrom = Payment({'source':Add2,'asset':lumen,'amount':'250','destination':Add1})
# # tx_sendfrom = Transaction(source = Add2,opts = {'sequence':sequence,'operations':[op_sendfrom]})
# # envelope_sendfrom = Te(tx=tx_sendfrom,opts = {'network_id':'TESTNET'})
# # envelope_sendfrom.sign(kp1)
# # xdr6 = envelope_sendfrom.xdr()
# # response6 = horizon.submit(xdr6)
# # passed_or_not(response6)
# #
# # #%%   Transaction that contains multiple operations
# # sequence = horizon.account(Add2).get('sequence')
# # lumen = Asset('XLM')
# # CMtest = Asset('CMtest1',Add1)
# # op_cmt_tx = Payment({'asset':CMtest,'amount':'50','destination':Add3,'source':Add2})
# # op_xlm_tx = Payment({'asset':lumen,'amount':'500','destination':Add2,'source':Add3})
# # tx_cmt_ex = Transaction(source=Add2,opts={'sequence':sequence,'fee':'200','operations':[op_cmt_tx,op_xlm_tx]})
# # envelope_cmt_ex = Te(tx = tx_cmt_ex,opts = {'network_id':'TESTNET'})
# # envelope_cmt_ex.sign(kp2)
# # envelope_cmt_ex.sign(kp3)        #The sequence of the signatures does matter, it must follow the operation sequences
# # xdr7 = envelope_cmt_ex.xdr()
# # response7 = horizon.submit(xdr7)
# # passed_or_not(response7)
# #
# # #%%   Transaction information from envelope
# # envelope_cmt_ex.tx.operations[0].asset.code        #checking ther asset name of the payment
# # envelope_cmt_ex.tx.operations[0].amount            #checking the amount of the payment
# # envelope_cmt_ex.signatures                         #How to understand the response of this function call?
# #
# #
