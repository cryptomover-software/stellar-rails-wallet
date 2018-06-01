# Stellar-Rails  
Stellar-Rails is an open source web browser based Stellar wallet created using Ruby on Rails web application framework.  
Master: [![Build Status](https://travis-ci.org/cryptomover-code/stellar-rails.svg?branch=master)](https://travis-ci.org/cryptomover-code/stellar-rails) | Development: [![Build Status](https://travis-ci.org/cryptomover-code/stellar-rails.svg?branch=development)](https://travis-ci.org/cryptomover-code/stellar-rails)

## Version 1.0

## Functionalities of the current website  
  1. Check account balances.  
  2. Send and receive Stellar assets.  
  3. Show transaction history.  
  4. Create new accounts.  
  5. Fund new accounts.  
  6. Trust Assets.  
  7. Login Using Trezor Hardware Wallet.  
  8. Login Using Federation address  
  9. Create Federation address with `cryptomover.com` domain  
  10. Send assets to federation address

## Technology Stack  
  1. Ruby 2.4.1  
  2. Ruby on Rails 5.1.2  
  3. Stellar API  
  4. Trezor Connect  
  
## For Developers: How to Setup
  1. Download Repository.  
  2. `cd` to directory.  
  3. Add `database.yml` with required configuration.  
  4. Run `rails db:migrate`  
  5. Run command `bundle install` to install necessary ruby gems.   
  6. Add Recaptcha Keys.  
  7. Add `config/application.yml` to store email and other configuration settings.  
  8. For production, add deploy script and your app server configuration.  
  9. For production, add `SECRET_KEY_BASE`  
  10. Run command `rails server` to start the server.  
  11. Access `http://localhost:3000` in your web browser.  
  
## ToDo
  1. Show the real-time NAV of cryptomover Index funds in USD.  
  2. Display customer's total NAV and history in USD.  
  3. Add Optional Database Backend Facility.  

## LICENSE

### MIT License

Copyright (c) 2017-2018 Cryptomover

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
