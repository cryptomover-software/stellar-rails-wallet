class AddEmailConfirmationTokenToFederation < ActiveRecord::Migration[5.1]
  def change
    add_column :federations, :email_confirmation_token, :string
    add_index :federations, :email_confirmation_token, unique: true
  end
end
