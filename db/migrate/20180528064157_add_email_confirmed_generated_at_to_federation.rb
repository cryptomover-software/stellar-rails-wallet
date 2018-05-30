class AddEmailConfirmedGeneratedAtToFederation < ActiveRecord::Migration[5.1]
  def change
    add_column :federations, :email_confirmation_generated_at, :timestamp
  end
end
