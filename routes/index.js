var express = require('express');
var router = express.Router();
var Task = require('../models/task');

/* GET home page, list of incomplete tasks */
router.get('/', function(req, res, next) {
  
  Task.find( {completed: false} )
    .then( (docs) => {
      res.render('index', {title: 'Incomplete tasks', tasks: docs} );
    })
    .catch( (err) => {
      next(err);    // Forward to the error handlers
    });
  
});



/* POST to create a new task */

router.post('/add', function(req, res, next){
  
  // Check if something was entered in the text input
  if (req.body.text) {
    // Create new Task
    var t = new Task({text: req.body.text, completed: false})
    // Save the task, and redirect to home page if successful
    t.save().then((newTask) => {
      // console.log('The new task created is ', newTask); // just for debugging
      res.redirect('/');  // Creates a GET request to '/'
    }).catch(() => {
      next(err);   // Forward error to the error handlers
    });
  }
  else {
    req.flash('error', 'Please enter a task.')  // Flash an error message
    res.redirect('/');  // And redirect to the home page
  }
  
});


/* POST to mark a task as done */
router.post('/done', function(req, res, next){
  
  Task.findByIdAndUpdate( req.body._id, {completed: true})
    .then( (originalTask) => {
      // originalTask only has a value if a document with this _id was found
      if (originalTask) {
        req.flash('info', originalTask.text + ' marked as done!');
        res.redirect('/');  // redirect to list of tasks
      } else {
        var err = new Error('Task Not Found');  // report Task not found with 404 status
        err.status = 404;
        next(err);
      }
    })
    .catch( (err) => {
      next(err);     // to error handlers
    });
  
});


/* GET completed tasks */

router.get('/completed', function(req, res, next){
  
  Task.find({completed: true})
    .then( (docs) => {
      res.render('completed_tasks', {tasks: docs});
    })
    .catch( (err) => {
      next(err);
    });
  
});


/* POST to delete a task */

router.post('/delete', function(req, res, next){
  
  Task.findByIdAndRemove(req.body._id)
    .then( (deletedTask) => {
      if (deletedTask) {
        req.flash('info', 'Task deleted.');
        res.redirect('/');
      } else {
        var error = new Error('Task Not Found')
        error.status = 404;
        next(error);
      }
  })
    .catch( (err) => {
      next(err);
    })
  
});


/* POST mark all tasks as done */

router.post('/alldone', function(req, res, next){

  Task.updateMany({completed: false}, {completed: true})
    .then( () => {
      req.flash('info', 'All tasks are done!');
      res.redirect('/');
    })
    .catch( (err) => {
      next(err);
    });
  
});


/* GET details about one task */

router.get('/task/:_id', function(req, res, next){
  
  Task.findById(req.params._id)
    .then( (doc) => {
      if (doc) {
        res.render('task', {task: doc});
      }
      else {
        next();  // to the 404 error handler
      }
    })
    .catch( (err) => {
      next(err);
    });
  
});


module.exports = router;



