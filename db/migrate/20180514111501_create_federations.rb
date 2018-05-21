class CreateFederations < ActiveRecord::Migration[5.1]
  def change
    create_table :federations do |t|
      t.text :username, null: false, unique: true
      t.text :address, null: false
      t.index :username, unique: true

      t.timestamps
    end
  end
end
