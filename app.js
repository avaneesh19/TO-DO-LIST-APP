//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
require('dotenv').config()
const mongoose = require("mongoose");
var _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));


app.use(express.static("public"));

const dbLink = process.env.DB_DATA;

mongoose.connect(dbLink, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// mongoose.connect('mongodb://localhost:27017/todolistDB', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

const itemSchema = mongoose.Schema({
  name: String
});

const Item = mongoose.model("item", itemSchema);


const item1 = new Item({
  name: "Welcome to To-do list app"
})

const item2 = new Item({
  name: "Press + to add new item"
})

const item3 = new Item({
  name: "Check it to delete"
})

var defaultItems = [item1, item2, item3];

const listSchema = mongoose.Schema({
  name:String,
  items:[itemSchema]
})

const List = mongoose.model("list",listSchema);

app.get("/", function(req, res) {

  // const day = date.getDate();
  Item.find({}, function(err, foundItems) {
    if (err)
      console.log(err);
    else {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function(err) {
          if (err)
            console.log(err);
          else
            console.log("successfully saved");
        })

        res.redirect("/");
      }
       else
       {
         List.find({},function(err,found){
           if(!found)
            res.render("home", {listTitle: "Today",newListItems: foundItems, lists:[]});
          else
          res.render("home", {listTitle: "Today",newListItems: foundItems, lists:found});

         });
       }
    }
  })
});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName =_.capitalize(req.body.list);

  const item = new Item({
    name: itemName
  })

  if(listName === "Today")
  {
    item.save();
    res.redirect("/");
  }
  else
  {
    List.findOne({name:listName},function(err,foundList){
      if(!err)
      {
        foundList.items.push(item);
        foundList.save();
      }
    })
    res.redirect("/"+listName);
  }

});


app.post("/create",function(req,res){
  const customListName = req.body.customListName;
  res.redirect("/"+customListName);
})


app.post("/delete", function(req, res) {
  const itemId = req.body.checkbox;
  const listName = _.capitalize(req.body.listName);

if(listName === "Today")
{
  Item.deleteOne({_id: itemId}, function(err) {
    if (err) {
      console.log(err);

    } else {
      console.log("successfully deleted");
    }
    res.redirect("/");
  })
}

else
{
  List.updateOne({name:listName},{$pull:{items:{_id:itemId}}},function(err,foundList){
    if(!err)
    {
      res.redirect("/"+listName);
    }
  });
}

});

app.get('/favicon.ico', (req, res) => res.status(204));


app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  console.log(customListName);
  List.findOne({name:customListName},function(err,foundOne){
    if(!err)
    {
      if(!foundOne)
      {
        const list = new List({
          name:customListName,
          items:[]
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else
      {
        res.render("list",{listTitle:customListName,newListItems:foundOne.items})
      }
    }
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(3000, function() {
  console.log("Server has started successfully");
});
