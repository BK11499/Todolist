//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://balakrishnan11499:test123@cluster0.8vboaha.mongodb.net/todolistDB",{useNewUrlParser:true})
.then(function(){
  console.log("MongoDB Connected Successfully");
})
.catch(function(err){
  console.log("Mongo Connection Problem");
});

const itemSchema = new mongoose.Schema({
  name:String
});

const Item = mongoose.model('Item',itemSchema);


  const buyFood = new Item({
    name:"Buy Food"
  });

  const cookFood = new Item({
    name:"Cook Food"
  });

  const eatFood = new Item({
    name:"Eat Food"
  });

  const defaultItems = [buyFood,cookFood,eatFood];

  const listSchema = new mongoose.Schema({
      name: String,
      items: [itemSchema]
  });

  const List = mongoose.model('List',listSchema);
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function(req, res) {

// const day = date.getDate();
    Item.find()
    .then(function(items){
      if(items.length === 0)
      {
        Item.insertMany(defaultItems)
        .then(function(){
          console.log("Documents added successfully in DB");
        })
        .catch(function(err){
          console.log(err);
        })
        res.redirect("/");
      }else{
        res.render("list", {listTitle: "Today", newListItems: items});
      }
    })
    .catch(function(err){
      console.log(err);
    });



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
      name:itemName
  });

  if(listName === "Today")
  {
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName})
    .then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
    .catch(function(err){
      console.log(err);
    })
  }


});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === 'Today')
  {
    Item.findByIdAndRemove(checkedItemId)
    .then(function(){
      res.redirect("/");
    })
    .catch(function(err){
      console.log(err);
    })
  }else{
    // Item.findByIdAndRemove(checkedItemId)
    // .then(function(){
    //   res.redirect("/");
    // })
    // .catch(function(err){
    //   console.log(err);
    // })
    List.findOneAndUpdate({name: listName},{$pull:{items:{_id:checkedItemId}}})
    .then(function(){
        res.redirect("/"+listName);
    })
    .catch(function(err){
      console.log(err);
    })
  }



})

app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);


    List.findOne({name:customListName})
    .then(function(foundedLists){
      if(!foundedLists)
      {
        const list = new List({
          name:customListName,
          items: defaultItems
        });

        list.save();
        // console.log("List Doesn't Exist");
        res.redirect("/" + customListName);
      }else{
        // console.log("List Exist");
        res.render("list",{listTitle:foundedLists.name, newListItems:foundedLists.items});
      }
    })
    .catch(function(err){
      console.log(err);
    })
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
