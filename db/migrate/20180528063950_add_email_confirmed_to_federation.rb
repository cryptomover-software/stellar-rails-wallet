class AddEmailConfirmedToFederation < ActiveRecord::Migration[5.1]
  def change
    add_column :federations, :email_confirmed, :boolean, default: false
  end
end
