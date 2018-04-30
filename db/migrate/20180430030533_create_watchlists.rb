class CreateWatchlists < ActiveRecord::Migration[5.1]
  def change
    create_table :watchlists do |t|
      t.text :address
      t.references :user, foreign_key: true

      t.timestamps
    end
  end
end
