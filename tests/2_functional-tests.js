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

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('create thread', function(done) {
       chai.request(server)
        .post('/api/threads/GodIsGood')
        .send({
          text: 'function test',
          delete_password: 'password',
        })
        .end(function(err, res){
         assert.equal(res.status, 200);
         done();
       })
      })
    });
    
    suite('GET', function() {
      test('get most recent threads', function(done) {
       chai.request(server)
        .get('/api/threads/GodIsGood')
        .end(function(err, res){
         //console.log('get', res.body);
         assert.equal(res.status, 200);
         assert.isAtMost(res.body.length, 10);
         assert.isAtMost(res.body[0].replies.length, 3);
         assert.notProperty(res.body[0], 'reported');
         assert.notProperty(res.body[0], 'delete_password');
         assert.property(res.body[0], 'text');
         assert.property(res.body[0], 'bumped_on');
         assert.property(res.body[0], 'created_on');
         assert.property(res.body[0], 'replies');
         done();
       })
      })
    });
    
    suite('DELETE', function() {
      test('delete a thread vaild password', function(done) {
       chai.request(server)
        .delete('/api/threads/GodIsGood')
        .send({thread_id: '5d9e089b2d11601345ccebbb',
               delete_password: 'password'})
        .end(function(err, res){
         assert.equal(res.status, 200);
         assert.equal(res.text, 'success');
         done();
       })
      })
      
      test('delete a thread invaild password', function(done) {
       chai.request(server)
        .delete('/api/threads/GodIsGood')
        .send({thread_id: '5d9d46bfe116634cc50c9212',
               delete_password: 'wrong'})
        .end(function(err, res){
         assert.equal(res.status, 200);
         assert.equal(res.text, 'incorrect password');
         done();
       })
      })
    });
    
    suite('PUT', function() {
      test('report a thread', function(done) {
       chai.request(server)
        .put('/api/threads/GodIsGood')
        .send({thread_id: '5d9d46bfe116634cc50c9212'})
        .end(function(err, res){
         assert.equal(res.status, 200);
         assert.equal(res.text, 'success');
         done();
       })
      })
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('create thread reply', function(done) {
       chai.request(server)
        .post('/api/replies/GodIsGood')
        .send({
          thread_id: '5d9d46bfe116634cc50c9212',
          text: 'function test reply',
          delete_password: 'password',
        })
        .end(function(err, res){
         assert.equal(res.status, 200);
         done();
       })
      })
    });
    
    suite('GET', function() {
      test('get all replies for a thread', function(done) {
       chai.request(server)
        .get('/api/replies/GodIsGood')
        .query({
         thread_id: '5d9d46bfe116634cc50c9212'
        })
        .end(function(err, res){
         console.log('get', res.body);
         assert.equal(res.status, 200);
         assert.notProperty(res.body, 'reported');
         assert.notProperty(res.body, 'delete_password');
         assert.property(res.body, 'text');
         assert.property(res.body, 'bumped_on');
         assert.property(res.body, 'created_on');
         assert.property(res.body, 'replies');
         assert.notProperty(res.body.replies[0], 'reported');
         assert.notProperty(res.body.replies[0], 'delete_password');
         assert.property(res.body.replies[0], 'text');
         assert.property(res.body.replies[0], '_id');
         assert.property(res.body.replies[0], 'created_on');
         done();
       })
      })
    });
    
    suite('PUT', function() {
      test('report a reply', function(done) {
       chai.request(server)
        .put('/api/replies/GodIsGood')
        .send({thread_id: '5d9d46bfe116634cc50c9212',
              reply_id: '5d9db828dfa64e218a489b99'})
        .end(function(err, res){
         assert.equal(res.status, 200);
         assert.equal(res.text, 'success');
         done();
       })
      })
    });
    
    suite('DELETE', function() {
      test('delete reply invalid password', function(done) {
       chai.request(server)
        .delete('/api/replies/GodIsGood')
        .send({thread_id: '5d9d46bfe116634cc50c9212',
               reply_id: '5d9db6ea29cd6919bf2c9812',
               delete_password: 'wrong'})
        .end(function(err, res){
         assert.equal(res.status, 200);
         assert.equal(res.text, 'incorrect password');
         done();
       })
      })
      
      test('delete reply valid password', function(done) {
       chai.request(server)
        .delete('/api/replies/GodIsGood')
        .send({thread_id: '5d9d46bfe116634cc50c9212',
               reply_id: '5d9db6e029cd6919bf2c9811',
               delete_password: 'password'})
        .end(function(err, res){
         assert.equal(res.status, 200);
         assert.equal(res.text, 'success');
         done();
       })
      })
    });
    
  });

});
