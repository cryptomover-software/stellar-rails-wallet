# Stellar-Rails  
Stellar-Rails is an open source Stellar wallet created using Ruby on Rails web application framework.  

## Version 0.5

## Functionalities of the current website  
  1. Check account balances.  
  2. Send and receive Stellar assets.  
  3. Show transaction history.  
  4. Create new accounts.  
  5. Fund new accounts.  
  6. Trust Assets.  
  7. Login Using Trezor Hardware Wallet.  
  
## For Developers: How to Setup
  1. Download Repository.  
  2. `cd` to directory.  
  3. Add `database.yml` with required configuration.  
  4. Run `rails db:migrate`  
  5. Run command `bundle install` to install necessary ruby gems.   
  6. Add Recaptcha Keys.  
  7. For production, add deploy script and your app server configuration.  
  8. For producion, add `SECRET_KEY_BASE`  
  9. Run command `rails server` to start the server.  
  10. Access `http://localhost:3000` in your web browser.  
  
## Todo
  1. Add Tests.  
  2. Show the real-time NAV of cryptomover Index funds in USD.  
  3. Display customer's total NAV and history in USD.  
  4. Add Optional Database Backend Facility.  

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
