/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.MONGO_URI; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {
  
  app.route('/api/threads/:board')
    .get((req, res) => {
     let board = req.params.board;
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        db.db('board').collection(board)
          .find({}, {delete_password: 0, reported: 0}, (err, found) => {
          found.toArray((err, doc) => {
           
           function compare(a, b) {
            // Use toUpperCase() to ignore character casing
            const bumpedA = a.bumped_on;
            const bumpedB = b.bumped_on;

            let comparison = 0;
            if (bumpedA < bumpedB) {
            comparison = 1;
            } else if (bumpedA > bumpedB) {
            comparison = -1;
            }
            return comparison;
            }

            doc.sort(compare);
          let maxLength; 
          if (doc.length < 10) {
            maxLength = doc.length
          } else {
            maxLength = 10;
          }
          let newDoc = [];
           // console.log(doc)
          
           for (let i = 0; i < maxLength; i++) {
            doc[i].replycount = doc[i].replies.length;
            doc[i].replies = doc[i].replies.slice(-3) 
            newDoc.push(doc[i]);
           }
            //console.log(newDoc);
            if (err) {
            console.log(err);
            } else {
            res.send(newDoc);
            }
          })
        })
      })
    })
  
    .post((req, res) => {
     let board = req.params.board || '';
     let text = req.body.text || '';
     let password = req.body.delete_password || '';
     if(text == '' || password == '' || board == '') {
       res.json({error: 'Missing required fieds'});
     } else {
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        db.db('board').collection(board)
          .insertOne({text: text || '',
                      delete_password: password,
                      created_on: new Date(),
                      bumped_on: new Date(),
                      reported: false,
                      replies: []}, 
            (err,doc) => {
              if (err) {
                res.json({error: err})
              } else{
                res.redirect('/b/'+ board + '/');
              }
            })
      }); 
     }
    })
  
    .put((req, res) => {
     let board = req.params.board;
     let id = req.body.thread_id || '';
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        db.db('board').collection(board)
          .findOne({_id: ObjectId(id)}, (err, data) =>{
            if (err) {
              res.json({error : 'error'})
            } else if(data) {
              data.reported = true;
              
              db.db('board').collection(board).save(data).then(update => {
                     res.send('success');
                  }).catch(error => {
                    res.send('could not update ' + id);
                  })
            } else {
              return res.json({error: '_id error'})
            }
        })
      })
    })
    
    .delete((req, res) => {
     let board = req.params.board;
     let id = req.body.thread_id || '';
     let password = req.body.delete_password || '';
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        db.db('board').collection(board)
          .findOne({_id: ObjectId(id)}, (err, data) =>{
            if (err) {
              res.json({error : 'error'})
            } else if(data) {
              if (password == data.delete_password) {
                db.db('board').collection(board).remove({_id: ObjectId(id)}, (err, success) => {
                  if (err) {
                    res.json({error : 'error'})
                  } else {
                    res.send('success');
                  }
                })
              } else {
                res.send('incorrect password');  
              }
            } else {
              return res.json({error: '_id error'})
            }
        })
      })
    })
  
  app.route('/api/replies/:board')
    .get((req, res) => {
     let board = req.params.board;
     let id = req.query.thread_id || '';
    
    
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        db.db('board').collection(board)
          .findOne({_id: ObjectId(id)}, {delete_password: 0, reported: 0}, (err, data) =>{
            if (err) {
              res.json({error : 'error'})
            } else if(data) {
              for (let i = 0; i < data.replies.length; i++) {
                delete data.replies[i].reported;
                delete data.replies[i].delete_password;
              }
              console.log(data)
              return res.send(data)
            } else {
              return res.json({error: '_id error'})
            }
        })

      })
    })
  
    .post((req, res) => {
     let board = req.params.board || '';
     let text = req.body.text || '';
     let password = req.body.delete_password || '';
     let id = req.body.thread_id || '';
     console.log(req.body)
     if(text == '' || password == '' || board == '' || id == '') {
       res.json({error: 'Missing required fieds'});
     } else {
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        db.db('board').collection(board)
        .findOne({_id: ObjectId(id)}, (err, data) =>{
            if (err) {
                res.json({error : 'error'})
            } else if(data) {
                  let reply = {
                    _id: new ObjectId(),
                    text: text,
                    created_on: new Date,
                    delete_password: password,
                    reported: false
                  }
                  data.replies.push(reply);
                  data.bumped_on = new Date;

                  db.db('board').collection(board).save(data).then(update => {
                    res.redirect('/b/' + board + '/' + id + '/');
                  }).catch(error => {
                    res.send('could not update ' + req.body._id)
                  })
            } else {
              return res.json({error: '_id error'})
            }
        }) // end findOne
       }) 
      }
    })
  
    .put((req, res) => {
     let board = req.params.board;
     let id = req.body.thread_id || '';
     let replyId = req.body.reply_id || '';
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        db.db('board').collection(board)
          .findOne({_id: ObjectId(id)}, (err, data) =>{
            if (err) {
              res.json({error : 'error'})
            } else if(data) {
              let reported = false;
              for (let i = 0; i < data.replies.length; i++) {
                if (data.replies[i]._id == replyId) {
                  data.replies[i].reported = true;
                  reported = true;
                }
              }
              if (reported) {
                  db.db('board').collection(board).save(data).then(update => {
                     res.send('success');
                  }).catch(error => {
                    res.send('could not update ' + replyId);
                  })
              } else {
                // console.log('incorrect password')
                res.send('incorrect reply Id'); 
              }
            } else {
              return res.json({error: '_id error'})
            }
        })
      })
    })
    
    .delete((req, res) => {
     let board = req.params.board;
     let id = req.body.thread_id || '';
     let replyId = req.body.reply_id || '';
     let password = req.body.delete_password || '';
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        db.db('board').collection(board)
          .findOne({_id: ObjectId(id)}, (err, data) =>{
            if (err) {
              res.json({error : 'error'})
            } else if(data) {
              let deleted = false;
              for (let i = 0; i < data.replies.length; i++) {
                // console.log(data.replies[i]._id, replyId, data.replies[i].delete_password, password)
                if (data.replies[i]._id == replyId && data.replies[i].delete_password == password) {
                  data.replies[i].text = '[deleted]';
                  deleted = true;
                  // console.log('for loop', data);
                }
              }
              if (deleted) {
                  db.db('board').collection(board).save(data).then(update => {
                     res.send('success');
                  }).catch(error => {
                    res.send('could not update ' + replyId);
                  })
              } else {
                // console.log('incorrect password')
                res.send('incorrect password'); 
              }
            } else {
              return res.json({error: '_id error'})
            }
        })
      })
    })
};
