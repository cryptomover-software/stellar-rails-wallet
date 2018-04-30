class Watchlist < ApplicationRecord
  belongs_to :user

  def process_list
    File.open('/tmp/testfile.txt', 'w') { |file| file.write(params[:address]) }
  end

  handle_asynchronously :process_list
end
