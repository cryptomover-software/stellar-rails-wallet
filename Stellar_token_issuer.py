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
