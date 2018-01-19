class CreateAccounts < ActiveRecord::Migration[5.1]
  def change
    create_table :accounts do |t|
      t.string :public_address
      t.string :seed
      t.string :name
      t.string :email
      t.timestamps
    end
  end
end
