# frozen_string_literal: true
Rails.application.config.session_store :cookie_store, key: 'address', expire_after: 5.minutes
