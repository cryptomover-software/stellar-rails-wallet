class ShopifyController < ApplicationController
  def checkout_create
    #https://help.shopify.com/api/reference/webhook
    @checkout = Checkout.new(checkout_id: params[:id],
                             email: params[:email],
                             total_price: params[:total_price],
                             params: params)
    @checkout.save
    render text: "ok"                         
  end
end
