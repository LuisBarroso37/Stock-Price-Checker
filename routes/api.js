/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const fetch = require('node-fetch');
let Stock = require('../models/stock.model');

// User story 6 - A good way to receive current price is the following external API(replacing 'GOOG' with your stock):
// https://repeated-alpaca.glitch.me/v1/stock/GOOG/quote
async function getStock(stock) { //this function gets stock market data from another project
  const fetchRes = await fetch(`https://repeated-alpaca.glitch.me/v1/stock/${stock}/quote`);
  const fetchResData = await fetchRes.json();
  
  return {
    stock: fetchResData.symbol,
    price: `${fetchResData.latestPrice}`
  }
}

module.exports = app => {

// User story 2 - I can GET /api/stock-prices with form data containing a Nasdaq stock ticker and receive back an object stockData
  app.route('/api/stock-prices')
    .get(async (req, res) => {
      let { stock, like } = req.query;
      let ip = req.ip; //saves ip address of the user
    
    if(typeof stock === 'string') {
      let stockData = await getStock(stock); //get stock and price of the stock that user wants
      stock = stock.toUpperCase();
      
      //store stock, price and likes of stock in database
      let storedStock = await Stock.findOneAndUpdate({stock}, {$set: {price: stockData['price']}}, {new: true, upsert: true, useFindAndModify: false});
      console.log(storedStock.likes.indexOf(ip) == -1)
// User story 4 - I can also pass along field "like" as true(boolean) to have my like added to the stock(s). Only 1 like per ip should be accepted.
      //if like = true and the ip address is not stored in database
      if(like == 'true' && storedStock.likes.indexOf(ip) == -1) {
        storedStock = await Stock.findOneAndUpdate({stock}, {$push: {likes: ip}}, {new: true, upsert: true, useFindAndModify: false}); //update likes property of stock
        
        // User story 3 - In stockData, I can see the stock(string, the ticker), price(decimal in string format), and likes(int).
        res.json({'stockData': {stock: storedStock.stock, price: storedStock.price, likes: storedStock.likes.length}});
      } else {
        res.json({'stockData': {stock: storedStock.stock, price: storedStock.price, likes: storedStock.likes.length}});
      }
    } else { //typeof stock === 'array'
      let stockData = stock.map(async s => {
        return await getStock(s);
      });
      
      let stockArr = await Promise.all(stockData); //Promise.all resolves all the asynchronous actions and saves all the information
      
      stock[0] = stock[0].toUpperCase();
      stock[1] = stock[1].toUpperCase();
      let stockPrice1 = stockArr[0].price;
      let stockPrice2 = stockArr[1].price;
      
      let storedStock1 = await Stock.findOneAndUpdate({stock: stock[0]}, {$set: {price: stockPrice1}}, {new: true, upsert: true, useFindAndModify: false});
      let storedStock2 = await Stock.findOneAndUpdate({stock: stock[1]}, {$set: {price: stockPrice2}}, {new: true, upsert: true, useFindAndModify: false});
      
      let arr = [];
      arr.push(storedStock1, storedStock2);
      
// User story 4 - I can also pass along field "like" as true(boolean) to have my like added to the stock(s). Only 1 like per ip should be accepted.
      if (like == 'true') {
        if (storedStock1.likes.indexOf(ip) == -1 && storedStock2.likes.indexOf(ip) == -1) {
          storedStock1 = await Stock.findOneAndUpdate({stock: stock[0]}, {$push: {likes: ip}}, {new: true, upsert: true, useFindAndModify: false});
          storedStock2 = await Stock.findOneAndUpdate({stock: stock[1]}, {$push: {likes: ip}}, {new: true, upsert: true, useFindAndModify: false});
        } else if (storedStock1.likes.indexOf(ip) > -1 && storedStock2.likes.indexOf(ip) == -1) {
          storedStock2 = await Stock.findOneAndUpdate({stock: stock[1]}, {$push: {likes: ip}}, {new: true, upsert: true, useFindAndModify: false});
        } else if (storedStock1.likes.indexOf(ip) == -1 && storedStock2.likes.indexOf(ip) > -1) {
          storedStock1 = await Stock.findOneAndUpdate({stock: stock[0]}, {$push: {likes: ip}}, {new: true, upsert: true, useFindAndModify: false});
        }
        
        arr = [];
        arr.push(storedStock1, storedStock2);
        
// User story 5 - If I pass along 2 stocks, the return object will be an array with both stock's info but instead of likes,
// it will display rel_likes(the difference between the likes on both) on both.
        res.json({'stockData': [{stock: arr[0].stock, price: arr[0].price, rel_likes: arr[0].likes.length - arr[1].likes.length},
                                {stock: arr[1].stock, price: arr[1].price, rel_likes: arr[1].likes.length - arr[0].likes.length}]});
      } else {
        res.json({'stockData': [{stock: arr[0].stock, price: arr[0].price, rel_likes: arr[0].likes.length - arr[1].likes.length},
                                {stock: arr[1].stock, price: arr[1].price, rel_likes: arr[1].likes.length - arr[0].likes.length}]});
      }

    }; 
  });
};


