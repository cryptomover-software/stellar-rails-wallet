class PagesController < ApplicationController  
  def index
    if session[:address].present?
      redirect_to wallet_path
    end
  end  

  def stellar_subscribe
    if request.post?
      @account = Account.new(params.require(:account).permit(:email, :public_address, :seed))
      @account.public_address = session[:address]
      @account.seed = session[:seed]
      if @account.save
        flash[:notice] = "you subscribe success, we will send you 20 lumens."
        # str = %Q(python3 -c 'from Stellar_token_issuer import *;Account_creation("GDNRWBDBEGMO7BSVOJ5DFLWXRUZDMTABUKBN6LRWJRREKYEFAOXEFZN2", "SAFZ4JAMYXLYHIDR2YNJ3XRAGBWOMMDXYAO7UWNKOHOREKFNDXYQI6NJ", 2)')
        # result = `#{str}`
        redirect_to "/stellar_account"
      else
        flash[:notice] =  "#{@account.errors.full_messages}, please try again"
        # render :layout => "dashboard"
      end
    else
      # render :layout => "dashboard"
    end
  end  
end
