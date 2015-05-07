/* Define all the routes */
Router.route('/', function () {
  this.render('users');
});

Router.route('/users', function () {
  this.render('users');
});

Router.route('/tasks', function () {
  this.render('tasks');
});

Router.map(function() {
    this.route('userdetail', {
    path: '/user-detail/:_userID',
    data: function(){
      var ID = this.params._userID;
      //ID = ID.substring(1,ID.length);
      console.log(ID);
      return Users.findOne({_id: ID});
    }
  });   
});

Router.map(function() {
    this.route('taskdetail', {
    path: '/task-detail/:_taskID',
    data: function(){
      var ID = this.params._taskID;
      // if(this.params.completed === true)
      //   $('#st').html('yes');
      // else
      //   $('#st').html('no');
      //ID = ID.substring(1,ID.length);
      console.log(ID);
      return Tasks.findOne({_id: ID});
    }
  });   
});

Router.map(function() {
    this.route('edittask', {
    path: '/edit-task/:_taskID',
    data: function(){
      var ID = this.params._taskID;
      //ID = ID.substring(1,ID.length);
      //console.log(ID);
      return Tasks.findOne({_id: ID});
    }
  });   
});

/****** Collections ******/
Users = new Mongo.Collection("users");
Tasks = new Mongo.Collection("tasks");

// pagination
//this.Pages = new Meteor.Pagination("Tasks");

if (Meteor.isClient) {
  Meteor.subscribe('tasks');
  Meteor.subscribe('users');
  /****** USERS ******/
  Template.users.helpers({
    users: function(){
      return Users.find({});
    }
  });

  Template.users.events({
    "click .add-user": function(event){
     var myname = $("#user-name").val();
     var myemail = $("#user-email").val();
     var pending = [];

     if(!myname || !myemail){
       alert('Name OR Email cannot be left empty');
     }
     //if(!myemail){
       // alert('Email must be entered to create a User');
     //}
     else {
      if(myemail.indexOf('@')<0 || myemail.indexOf('.')<0 || myemail.indexOf('.')==myemail.length-1)
        alert('Wrong format for email. Correct example : user@example.com');
      else if(Users.find({email: myemail}).count() > 0)
        alert('User with the email '+ myemail + ' already exists!!');
      else{
          Users.insert({
             name: myname,
             email: myemail,
             pendingTasks: pending,
             createdAt: new Date()
          });

        $("#user-name").val('');
        $("#user-email").val('');
        $("#UserModal").foundation('reveal','close');
      }
    }
    },

    "click .delete-user": function(event){
      // number of pending Tasks this User has
      var count = Tasks.find({assignedUser: this._id, completed: false}).count();

      // pending Tasks in an array
      var pending = Tasks.find({assignedUser: this._id, completed: false}).fetch();
      //console.log(ID);

      for (var i=0; i<count; i++) {
        Tasks.update({_id: pending[i]._id}, 
            {
              name: pending[i].name,
              description: pending[i].description,
              deadline: pending[i].deadline,
              completed: pending[i].completed,
              assignedUserName: 'unassigned', 
              assignedUser: '',
              dateCreated: pending[i].dateCreated
            }
        );
      }
      //Tasks.update({assignedUser: this._id}, {assignedUser: 'unassigned'});

     Users.remove({
       _id: this._id
      });
    }
  });

  Template.userdetail.helpers({
    'pendingtasks' : function(){
      console.log(Router.current().params._userID);
      console.log(Tasks.find({assignedUser: Router.current().params._userID}).fetch());
      return Tasks.find({assignedUser: Router.current().params._userID, completed: false});
    }
  });

  Template.userdetail.events({
    'click #complete' : function(event) {
        console.log(Tasks.find({_id: this._id}).fetch());
        console.log(Users.find({_id: this.assignedUser}).fetch());
        Users.update(
          { _id: this.assignedUser},
          { $pullAll: 
            {
              pendingTasks: [this._id]
            }
          }
        );

        Tasks.update(
          { _id: this._id},
          { $set: 
            {
              completed: true
            }
          }
        );
    }
  });

  /****************************************************************************/
  /******************************* TASK HELPERS *******************************/
  /****************************************************************************/
  Template.tasks.helpers({
    'currtasks': function(){
      var limit = 3;

      var filter = Session.setDefault('filterTaskBy', 'all');
      var sortBy = Session.setDefault('sortTaskBy', 'name');
      var order = Session.setDefault('orderTaskBy', 'asc');
      var count = Session.setDefault('skipCount',0);
      var currCount = Session.setDefault('currCount',0);

      filter = Session.get('filterTaskBy');
      sortBy = Session.get('sortTaskBy');
      order = Session.get('orderTaskBy');

      count = Session.get('skipCount');

      if (filter == 'completed'){
        Session.set('currCount', Tasks.find({completed:true}).count());
        //console.log('******* INSIDE COMPLETED *****');
        console.log('start is ' + count + ' and end is ' + (count+2));
        // sort by task name
        if (sortBy == 'name'){
          //console.log('******* INSIDE NAME *****');
          if (order == 'asc'){
            var retVal = Tasks.find({completed: true}, {sort: {name: 1}}).fetch();
            return retVal.slice(count,count+2);
          }
          if (order == 'desc'){
            var retVal = Tasks.find({completed: true}, {sort: {name: -1}}).fetch();
            return retVal.slice(count,count+2);
          }
        }

        // sort by user name  
        if (sortBy == 'assignedUserName'){
          if (order == 'asc'){
            var retVal = Tasks.find({completed: true}, {sort: {assignedUserName: 1}}).fetch();
            return retVal.slice(count,count+2);
          }
          if (order == 'desc'){
            var retVal = Tasks.find({completed: true}, {sort: {assignedUserName: -1}}).fetch();
            return retVal.slice(count,count+2);
          }
        }

        // sort by date
        if (sortBy == 'deadline'){
          if (order == 'asc'){
            var retVal = Tasks.find({completed: true}, {sort: {deadline: 1}}).fetch();
            return retVal.slice(count,count+2);
          }
          if (order == 'desc'){
            var retVal = Tasks.find({completed: true}, {sort: {deadline: -1}}).fetch();
            return retVal.slice(count,count+2);
          }
        }

        // sort by deadline
        if (sortBy == 'dateCreated'){
          if (order == 'asc'){
            var retVal = Tasks.find({completed: true}, {sort: {dateCreated: 1}}).fetch();
            return retVal.slice(count,count+2);
          }
          if (order == 'desc'){
            var retVal = Tasks.find({completed: true}, {sort: {dateCreated: -1}}).fetch();
            return retVal.slice(count,count+2);
          }   
        }
      }

      if (filter == 'pending'){
        Session.set('currCount', Tasks.find({completed:false}).count());
        // sort by task name
        if (sortBy == 'name'){
          if (order == 'asc'){
            var retVal = Tasks.find({completed: false}, {sort: {name: 1}}).fetch();
            return retVal.slice(count,count+2);
          }
          if (order == 'desc'){
            var retVal = Tasks.find({completed: false}, {sort: {name: -1}}).fetch();
            return retVal.slice(count,count+2);
          }
        }

        // sort by user name  
        if (sortBy == 'assignedUserName'){
          if (order == 'asc'){
            var retVal = Tasks.find({completed: false}, {sort: {assignedUserName: 1}}).fetch();
            return retVal.slice(count,count+2);
          }
          if (order == 'desc'){
            var retVal = Tasks.find({completed: false}, {sort: {assignedUserName: -1}}).fetch();
            return retVal.slice(count,count+2);
          }
        }

        // sort by date
        if (sortBy == 'deadline'){
          if (order == 'asc'){
            var retVal = Tasks.find({completed: false}, {sort: {deadline: 1}}).fetch();
            return retVal.slice(count,count+2);
          }
          if (order == 'desc'){
            var retVal = Tasks.find({completed: false}, {sort: {deadline: -1}}).fetch();
            return retVal.slice(count,count+2);
          }
        }

        // sort by deadline
        if (sortBy == 'dateCreated'){
          if (order == 'asc'){
            var retVal = Tasks.find({completed: false}, {sort: {dateCreated: 1}}).fetch();
            return retVal.slice(count,count+2);
          }
          if (order == 'desc'){
            var retVal = Tasks.find({completed: false}, {sort: {dateCreated: -1}}).fetch();
            return retVal.slice(count,count+2);
          }
        }
      }
      if (filter == 'all')
      {
        Session.set('currCount', Tasks.find({}).count());
        // sort by task name
        if (sortBy == 'name'){
          if (order == 'asc'){
            var retVal = Tasks.find({}, {sort: {name: 1}}).fetch();
            return retVal.slice(count,count+2);
          }
          if (order == 'desc'){
            var retVal = Tasks.find({}, {sort: {name: -1}}).fetch();
            return retVal.slice(count,count+2);
          }
        }

        // sort by user name  
        if (sortBy == 'assignedUserName'){
          if (order == 'asc'){
            var retVal = Tasks.find({}, {sort: {assignedUserName: 1}}).fetch();
            return retVal.slice(count,count+2);
          }
          if (order == 'desc'){
            var retVal = Tasks.find({}, {sort: {assignedUserName: -1}}).fetch();
            return retVal.slice(count,count+2);
          }
        }

        // sort by date
        if (sortBy == 'dateCreated'){
          if (order == 'asc'){
            var retVal = Tasks.find({}, {sort: {dateCreated: 1}}).fetch();
            return retVal.slice(count,count+2);
          }
          if (order == 'desc'){
            var retVal = Tasks.find({}, {sort: {dateCreated: -1}}.fetch());
            return retVal.slice(count,count+2);
          }
        }

        // sort by deadline
        if (sortBy == 'deadline'){
          if (order == 'asc'){
            var retVal = Tasks.find({}, {sort: {deadline: 1}}).fetch();
            return retVal.slice(count,count+2);
          }
          if (order == 'desc'){
            var retVal = Tasks.find({}, {sort: {deadline: -1}}).fetch();
            return retVal.slice(count,count+2);
          }
        }
      }
    },
    'users' : function(){
      return Users.find({});
    }
  });

  Template.tasks.events({
    "click .add-task": function(event){
     var myname = $("#task-name").val();
     var mydescription = $("#task-description").val();
     var mydeadline = $("#task-deadline").val();
     var completed = $("#task-completed").val();
     //var userName = $("#assigned-user").val();
     var userName = $('#assigned-user :selected').text();

     var userID = Users.find({name: userName}).fetch();

     if(!myname || !mydeadline){
        alert('Please enter a "name" and a "deadline" !!');
     }
     else {
       if (!completed)
          completed = false;

       if (completed == 'true')
          completed = true;
       else completed = false;

        Tasks.insert({
           name: myname,
           description: mydescription,
           deadline: mydeadline,
           completed: completed,
           assignedUserName: userName,
           assignedUser: userID[0]._id,
           dateCreated: new Date()
        });

        var tID = Tasks.find({name: myname, assignedUser: userID[0]._id}).fetch();

        Users.update(
            { _id: userID[0]._id},
            { $push: { pendingTasks: tID[0]._id}}
          );

      $("#task-name").val('');
      $("#task-description").val('');
      $("#task-deadline").val('');
      $("#task-completed").val('');
      $("#assigned-user").val('');

      $("#TaskModal").foundation('reveal','close');
    }
    },

    "click .delete-task": function(event){
      // get the User information assigned to this Task if User not Unassigned
      if (this.assignedUser != ''){
        var assigned = Users.find({_id: this.assignedUser}).fetch();

        if (assigned[0] != undefined) {
          Users.update(
            {_id: assigned[0]._id}, 
            {$pull: {pendingTasks: [this._id]}}
          );
        }
      }

      Tasks.remove({
        _id: this._id
      })
    },

    'click #pending' : function(){
        var pending = Tasks.find({completed:false});
        for(var i=0; i<pending.count(); i++){  
          Session.set('pending', pending.fetch()[i].name);
          var a = Session.get('pending');
          console.log(a);
        }
    },

    'change #filter-by' : function(event,template){
        Session.set('skipCount', 0);
        var filter = $(event.currentTarget).val();
        Session.set('filterTaskBy', filter);
    },

    'change #sort-by' : function(event,template){
        var sort = $(event.currentTarget).val();
        //console.log('sort val is ' +  sort);

        Session.set('sortTaskBy', sort);
    },

    'change #order-by' : function(event,template){
        var order = $(event.currentTarget).val();
        //console.log('order val is ' +  order);

        Session.set('orderTaskBy', order);
    },
    'click #skip-next' : function(event,template){
      if(Session.get('skipCount')+2 < Session.get('currCount'))
        Session.set('skipCount', Session.get('skipCount')+2);
    },
    'click #skip-prev' : function(event,template){
      if(Session.get('skipCount') >= 2)
        Session.set('skipCount', Session.get('skipCount')-2);
    }
  });

/*******************************************************************************/
/***************************** END TASK ****************************************/
/*******************************************************************************/
  // Template.taskdetail.helpers({
  //   'status' : function(){
  //     Session.setDefault('status', )
  //   }
  // })
  Template.taskdetail.events({
    'click #status' : function(event) {
        //console.log(Tasks.find({_id: this._id}).fetch());
        //console.log(Users.find({_id: this.assignedUser}).fetch());
        
        // now set it to false
        if (this.completed == true)
        {
          //Session.set('status', 0);
          Tasks.update(
            { _id: this._id},
            { $set: 
              {
                completed: false
              }
            }
          );
          $('#currState').html('Task completed status set to FALSE');
          if(this.assignedUser != ''){
            Users.update(
              { _id: this.assignedUser},
              { $pullAll: 
                {
                  pendingTasks: [this._id]
                }
              }
            );
          }
        }
        else
        {
           //Session.set('status', 1);
           Tasks.update(
              { _id: this._id},
              { $set: 
                {
                  completed: true
                }
              }
            );
            $('#currState').html('Task completed status set to TRUE');
           if(this.assignedUser != ''){
            Users.update(
              { _id: this.assignedUser},
              { $push: 
                {
                  pendingTasks: [this._id]
                }
              }
            );
          }
        }
    }
  });

  Template.edittask.helpers({
    'users' : function(){
      var myTask = Tasks.find({_id : this._id}).fetch();
      $("#task-name").val(myTask[0].name);
      $("#task-description").val(myTask[0].description);
      $("#task-deadline").val(myTask[0].deadline);
      $("#task-completed").val(myTask[0].completed);

      return Users.find({});
    }
  });

    Template.edittask.events({
    "click .edit-task": function(event){
     var myname = $("#task-name").val();
     var mydescription = $("#task-description").val();
     var mydeadline = $("#task-deadline").val();
     var completed = $("#task-completed").val();
     var userName = $('#assigned-user :selected').text();

      if(!mydeadline || !myname)
      {
        alert('You MUST enter a Task name AND a Task deadline');
      }

      else
      {
      var myTask = Tasks.find({_id : this._id}).fetch();
      // $("#task-name").val(myname);
      // $("#task-description").val(mydescription);
      // $("#task-deadline").val(mydeadline);
      // $("#task-completed").val(completed);
      // $("#assigned-user").val(userName);
        if(completed != true)
          completed = false;

        Tasks.update(
          {_id : this._id},
          { 
            $set: {
                  name: myname,
                  description: mydescription,
                  deadline: mydeadline,
                  completed: completed,
                  assignedUserName: userName
                  }
          });

          if(myTask[0].assignedUserName == "unassigned"){
            // if now pending, add to pending of new user
            if (!completed){
                var newUser = Users.find({name : userName}).fetch();
                Users.update( {_id: newUser[0]._id}, { $push: { pendingTasks: [this.id] } } );
              }
          }

          // same user as before
          else if (myTask[0].assignedUserName == userName){
            // pending before
            if (!myTask[0].completed){
              // complete now
              if (completed){
                Users.update( {_id: myTask[0].assignedUser}, { $pull: { pendingTasks: [this.id] } } );
              }
            }

            else {
                // true before
                if(!completed){
                     Users.update( {_id: myTask[0].assignedUser}, { $push: {pendingTasks: [this.id]} } );
                }
            }
          }

        // different User than before
        else if (myTask[0].assignedUserName != userName){
          // if pending before remove it from his pending
          if (!myTask[0].completed){
            Users.update( {_id: myTask[0].assignedUser}, { $pull: { pendingTasks: [this.id] } } );
          }
          // if now pending, add to pending of new user
          if (!completed){
            var newUser = Users.find({name : userName}).fetch();
            Users.update( {_id: newUser[0]._id}, { $push: { pendingTasks: [this.id] } } );
          }
        }

      $("#task-name").val('');
      $("#task-description").val('');
      $("#task-deadline").val('');
      $("#task-completed").val('');
      $("#assigned-user").val('');
    }
  }
  });
}


  if (Meteor.isServer){
    //console.log("Hello Server");
    Meteor.publish('users', function(){
      return Users.find({});
    });
    Meteor.publish('tasks', function(){
      return Tasks.find({});
    });
  }