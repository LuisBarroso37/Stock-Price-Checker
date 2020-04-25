/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

// User story 7 - All 5 functional tests are complete and passing.
suite('Functional Tests', () => {
    
    suite('GET /api/stock-prices => stockData object', () => {
      
      test('1 stock', done => {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'jpm'})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, 'JPM');
          assert.equal(res.body.stockData.price, '91.13');
          assert.equal(res.body.stockData.likes, 1);
          done();
        });
      });
      
      let likes;
      
      test('1 stock with like', done => {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'jpm', like: true})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, 'JPM');
          assert.equal(res.body.stockData.price, '91.13');
          assert.equal(res.body.stockData.likes, 1);
          likes = res.body.stockData.likes;
          done();
        });
      });
      
      test('1 stock with like again (ensure likes arent double counted)', done => {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'jpm', like: true})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, 'JPM');
          assert.equal(res.body.stockData.price, '91.13');
          assert.equal(res.body.stockData.likes, likes);
          done();
        });
      });
      
      test('2 stocks', done => {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['msft', 'goog']})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData[0].stock, 'MSFT');
          assert.equal(res.body.stockData[1].stock, 'GOOG');
          assert.equal(res.body.stockData[0].price, '149.7');
          assert.equal(res.body.stockData[1].price, '1110.71');
          assert.equal(res.body.stockData[0].rel_likes, 0);
          assert.equal(res.body.stockData[1].rel_likes, 0);
          done();
        });
      });
      
      test('2 stocks with like', done => {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['msft', 'goog'], like: true})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData[0].stock, 'MSFT');
          assert.equal(res.body.stockData[1].stock, 'GOOG');
          assert.equal(res.body.stockData[0].price, '149.7');
          assert.equal(res.body.stockData[1].price, '1110.71');
          assert.equal(res.body.stockData[0].rel_likes, 0);
          assert.equal(res.body.stockData[1].rel_likes, 0);
          done();
        });
      });
      
    });

});
