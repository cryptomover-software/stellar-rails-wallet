class AddUnqueIndexToAddress < ActiveRecord::Migration[5.1]
  def change
    add_index :federations, :address, :unique => true
  end
end
