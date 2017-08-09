class CreateCheckouts < ActiveRecord::Migration[5.1]
  def change
    create_table :checkouts do |t|
      t.string :params
      t.string :checkout_id
      t.string :email
      t.datetime :checkout_created_at
      t.float :total_price
      t.timestamps
    end
  end
end
