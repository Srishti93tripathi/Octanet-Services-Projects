const mongoose= require("mongoose");
const initData= require("./data.js");
const Task= require("../models/tasks.js");

main()
.then((res) => {
    console.log("connection successful");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/TaskNest');
}

const initDB = async () => {
    await Task.deleteMany({});
   // initData.data = initData.data.map((obj) => ({...obj, owner: "66e5eab57e0f10ff3915f371"}));
    await Task.insertMany(initData.data);
    console.log("data was initialized");
}

initDB();