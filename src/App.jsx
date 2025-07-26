import './App.css'
import React from 'react';
import Task from '/src/Task';
// import TaskData from '/src/task-data.js';
import { initializeApp } from "firebase/app";
import * as functions from 'firebase/functions';
import {getDatabase, ref, push, onValue, query, orderByChild, equalTo, get, update, remove} from "firebase/database"

const appSettings = { 
	databaseURL: "https://todo-list-333d8-default-rtdb.firebaseio.com/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const tasksInDB = ref(database, "tasks")

let task = {
    // id: 2,
    // task_entry: 'shower',
    // done: false,
  }


function App() {
  const [tasks, setTasks] = React.useState([]);

  //initial loading of firebase database
  React.useEffect(() => {
    const unsubscribe = onValue(tasksInDB, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const dataArray = Object.values(data);

        setTasks(dataArray); 

        console.log("Current Task Entries:");
        dataArray.forEach(task => {
          if (task && task.task_entry) {
            console.log(task.task_entry);
          }
        });

      } else {
        console.log("No data available at this Firebase path.");
        setTasks([]); 
      }
    });

    return () => {
      unsubscribe();
    };

  }, []); 
  // console.log(functions.config().firbase.api.key)

  var newest_task = undefined;

  /*
    1. Change tasks state array to make task.done to be flipped
    2. Change tasks state array to change id to be ordered 
    appropriately
    3. Make changes to DB
  */
  function toggleDone(id) {
    setTasks(prevTasks => {
        // Find the index of the task to be toggled
        const taskID = prevTasks.findIndex(item => item.id === id);
        
        if (taskID == -1){throw new Error('Task Not Found')}

        const updatedTasks = [...prevTasks]; // Create a shallow copy of the tasks
        const toggled_item = { 
            ...updatedTasks[taskID], 
            done: !updatedTasks[taskID].done,
            id: updatedTasks[taskID].id + (updatedTasks[taskID].done ? -1000 : 1000) 
        };

        updatedTasks[taskID] = toggled_item; 

        updateEntryInDB(id, toggled_item);
        
        return updatedTasks;
    });
}


  async function searchTaskByIdinDB(searchId){
    const db = getDatabase();
    const tasksRef = ref(db, 'tasks');
    const taskQuery = query(tasksRef, orderByChild('id'), equalTo(searchId));

    try {
      const snapshot = await get(taskQuery);

      if (snapshot.exists()) {
        let firstMatchingKey = null;
        snapshot.forEach((childSnapshot) => {
          if (firstMatchingKey === null) {
              firstMatchingKey = childSnapshot.key;
          }
        });

        if (firstMatchingKey) {
          return ref(db, `tasks/${firstMatchingKey}`);
        } else {
          console.log(`Snapshot existed, but no children were iterated.`);
          return null;
        }
      } else {
        console.error(`No task found with ID: ${searchId}`);
        return null;
      }
    } catch (error) {
      console.error("Error searching for task reference:", error);
      throw error;
    }
  }

  function updateEntryInDB(prev_id, task_item_to_update){
    (async () => {
      console.log("Updating DB Entry")
      console.log(task_item_to_update)
      const result = await searchTaskByIdinDB(prev_id);

      if (result) {
        console.log(`modifying task with ID "${prev_id}":`);
        update(result, task_item_to_update)
      } 
      else { console.error(`No tasks found with ID "${prev_id}".`);}

    })();

  }

  function assignTask(formData) {

    const task_content = formData.get("task_content");
    const id = Number(formData.get("id"));

    setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(item => {
            return item.id === id ? { ...item, task_entry: task_content } : item;
        });

        updateEntryInDB(id, tasks[id-1]);
        return updatedTasks;
    });
  }

  function handleChange(id){
    const changed_content = event.target.value
     setTasks(prevTask => prevTask.map(item => {
      return item.id === id ? {...item, task_entry: changed_content} : item
    }))
  }
  const sortedTasks = [...tasks].sort((a, b) => a.id - b.id);

  const taskElements = sortedTasks.map(task => (
    <Task 
    handleChange={handleChange}
    assignTask={assignTask}
    toggleDone={toggleDone} 
    key={task.id} 
    task_entry={task.task_entry} 
    done={task.done} 
    id={task.id}
    removeTask={removeTask} />
  ))

  function updateEntryInDB(prev_id, task_item_to_update){
    (async () => {
      console.log("Updating DB Entry")
      console.log(task_item_to_update)
      const result = await searchTaskByIdinDB(prev_id);

      if (result) {
        console.log(`modifying task with ID "${prev_id}":`);
        update(result, task_item_to_update)
      } 
      else { console.error(`No tasks found with ID "${prev_id}".`);}

    })();
    
  }

  function addEntryInDB(task){
    const db = getDatabase();
    const tasksRef = ref(db, 'tasks');
    
    console.log(task)
    push(tasksRef, task);
    console.log("added new task to db")
  }

  function addTask() {

    const empty_task_id = findEmptyTaskID();
    if(!empty_task_id){
      const new_task = { done: false,
          id: tasks.length + 1, 
          task_entry: ``,};
      setTasks(prevTask =>[...prevTask, new_task
        ] 
      )
      addEntryInDB(new_task)
    }

    
    
    //activates if "new reminder" is pressed again
    var lowest_unfinished_task_id = 0;
      tasks.map(item => {
        if(lowest_unfinished_task_id < item.id && item.id < 1000)
          {lowest_unfinished_task_id = item.id;}
      })
    // console.log(document.querySelectorAll('input'));
    // console.log(lowest_unfinished_task_id)
    const input_elements = document.querySelectorAll('input');
    const newest_input = Array.from(input_elements).find(input => input.id === `${lowest_unfinished_task_id}`);
    newest_input.focus();
  }


  // automatically focus to newest empty task
  React.useEffect(() => {
    const empty_task_id = findEmptyTaskID();
    if(empty_task_id){
    var lowest_unfinished_task_id = 0;
    tasks.map(item => {
      if(lowest_unfinished_task_id < item.id && item.id < 1000)
        {lowest_unfinished_task_id = item.id;}
    })
    // console.log(document.querySelectorAll('input'));
    // console.log(lowest_unfinished_task_id)
    const input_elements = document.querySelectorAll('input');
    const newest_input = Array.from(input_elements).find(input => input.id === `${lowest_unfinished_task_id}`);
    newest_input.focus();
  }
    
  }, [tasks]);

  // Handle pressing enter and adding new task
  React.useEffect(() => {
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
          setTimeout(() => {
            console.log("added task with enter")
            addTask();
          }, 10);
        }
    };
  document.addEventListener('keydown', handleKeyPress);

  return () => {
      document.removeEventListener('keydown', handleKeyPress);}
  }, [tasks, addTask]);
  
  function removeEntryInDB(id) {
    (async () => {
      const result = await searchTaskByIdinDB(id);

      if(result){
      remove(result)
        .then(() => {
            console.log("Removed task from DB successfully.");
        })
        .catch((error) => {
            console.error("Error removing task from DB:", error);
        });
      }
      else {console.error(`No tasks found with ID "${prev_id}".`);}
    })();
    }

  function removeTask(id) {
    setTasks(prevTasks => prevTasks.filter(item => item.id !== id));
    console.log(`Deleted ID: ${id}`);
    removeEntryInDB(Number(id));
  }

  function findEmptyTaskID(){
    return tasks.find(item => item.task_entry === '')?.id;
  }
      
  // auto delete task component functionality of cursor clicks off screen while textbox is empty
  React.useEffect(() => {

    const handleClick = (event) => {
      if (event.target === document.body) {
        const empty_task_id = findEmptyTaskID();
        if(empty_task_id){removeTask(empty_task_id)}
      }
    };
    document.body.addEventListener('click', handleClick);
    // Cleanup 
    return () => {
      document.body.removeEventListener('click', handleClick);

    // console.log("AutoDelete: Updated tasks:", tasks);
  }

  }, [tasks, removeTask]);


  return (
    <div className='App'>
      <h1>To-Do List</h1>
      {taskElements}
      <div className='add-container' onClick={addTask}>
        <button className='add'>
        <p className='add'>+</p>
        </button>
        <h2>New Reminder</h2>
      </div>
    </div>
  );
}

export default App