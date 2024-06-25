import { useState } from "react";
import "./App.css";

function App() {

  const [todoList, setTodoList] = useState([]);
  const [newTask, setNewTask] = useState("");

  const handleOnChange = (e) => {
    setNewTask(e.target.value);
  };

  const handleAddTask = () => {
    const newTodoList = [...todoList, newTask];
    setTodoList(newTodoList);
    setNewTask("")
  };

  const deleteTask = (taskName) => {
    // const newTodoList = todoList.filter((task,key) =>{
    //   if(task === taskName ){
    //     return false
    //   }
    //   return true
    // })
    // setTodoList(newTodoList)

    //Or 

    setTodoList(todoList.filter((task) => task !== taskName));

  }
 
  return (
    <div className="App">
      <div className="addTask">
        <input onChange={handleOnChange}></input>
        <button onClick={handleAddTask}> Add new Task</button>
      </div>
      <div className="list">
        {todoList.map((task,key) => {
          return <div key = {key}><h1 >{task}</h1><button onClick={() => deleteTask(task)}>x</button></div>
        })}
      </div>
    </div>
  );
}

export default App;
