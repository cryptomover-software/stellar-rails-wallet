# frozen_string_literal: true

require 'pg'

CM_FEDERATION_HOST = ENV['CM_FEDERATION_HOST']
CM_FEDERATION_PORT = ENV['CM_FEDERATION_PORT']
CM_FEDERATION_DB = ENV['CM_FEDERATION_DB']
CM_FEDERATION_USERNAME = ENV['CM_FEDERATION_USERNAME']
CM_FEDERATION_PASSWORD = ENV['CM_FEDERATION_PASSWORD']

namespace :federation do
  desc 'Sync addresses in bulk to Remote Stellar Federation DB'
  task sync_addresses: :environment do
    conn = PG.connect(dbname: CM_FEDERATION_DB,
                      host: CM_FEDERATION_HOST,
                      port: CM_FEDERATION_PORT,
                      user: CM_FEDERATION_USERNAME,
                      password: CM_FEDERATION_PASSWORD)
    # conn.exec('SELECt * from accounts')
    Federation.find_each do |f|
      # because SQLite
      unless f.synced
        puts "Adding #{f.address} To Remote Stellar Federation Database."
        conn.exec("insert into accounts (name, address) values ('#{f.username}', '#{f.address}');")
        conn.exec('commit;')
        f.synced = true
        f.save!
      end
    end
  end
end

