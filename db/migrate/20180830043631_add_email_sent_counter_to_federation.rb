class AddEmailSentCounterToFederation < ActiveRecord::Migration[5.1]
  def change
    add_column :federations, :emails_sent, :integer, default: 1
  end
end
