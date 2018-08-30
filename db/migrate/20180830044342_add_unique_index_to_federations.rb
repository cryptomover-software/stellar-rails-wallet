class AddUniqueIndexToFederations < ActiveRecord::Migration[5.1]
  def change
    add_index :federations, [:username, :address], unique: true
  end
end
