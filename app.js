//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//local
// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");
//atlas
// mongoose.connect("mongodb://admin-alizahid:Test123@ac-bzk4qcx-shard-00-00.9huxjqi.mongodb.net:27017,ac-bzk4qcx-shard-00-01.9huxjqi.mongodb.net:27017,ac-bzk4qcx-shard-00-02.9huxjqi.mongodb.net:27017/?ssl=true&replicaSet=atlas-113ooz-shard-0&authSource=admin&retryWrites=true&w=majority/todolistDB");
//cyclic
mongoose.connect("mongodb+srv://admin-alizahid:Test123@cluster0.9huxjqi.mongodb.net/test");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your ToDo List!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item.>"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    // console.log(foundItems);

    if(foundItems.length === 0){

      Item.insertMany(defaultItems, function(err){
  if (err){
    console.log(err);
  } else{
    console.log("Successfully saved default items to DB");
  }
});
    res.redirect("/");
    } else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});

    }

  });
});


app.get("/:customListName", function(req, res){
  // console.log(req.params.customListName);

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        // console.log("Doesnt exist!");

        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
      
        });
      
        list.save();
        res.redirect("/" + customListName);
      } else{
        // console.log("Exists");

        //show an existing list

        res.render("list", {listTitle: foundList.name, newListItems: foundList.items} );
      }
    }
  });



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });


  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else{
    List.findOne({name: listName}, function(err, foundList){

        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      
    });
  }


});


app.post("/delete", function(req, res){
  // console.log(req.body.checkBox);

  const checkedItemId = req.body.checkBox;
  const listName = req.body.listName;

  if(listName === "Today"){

    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
      
        console.log("Successfully deleted the checked item.");
        res.redirect("/");
      }
    });
  } else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }

 
});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
