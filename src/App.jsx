import './App.css'
import React from 'react';
import Task from '/src/Task';
import TaskData from '/src/task-data.js';

function App() {
  const [tasks, setTasks] = React.useState(TaskData);

  var newest_task = undefined;

  function toggleDone(id){
    setTasks(prevTask => {
        const updatedTasks = prevTask.map(item => {
            return item.id === id ? { ...item, done: !item.done } : item;
        });

        // Find the toggled item after the update
        var toggled_item = updatedTasks.find(item => item.id === id);
        if(toggled_item.done){toggled_item.id += 1000}
        else if(!toggled_item.done){ toggled_item.id -= 1000 }
           setTasks(prevTasks => prevTasks.sort((a,b) => a.id - b.id)); 
        setTasks(prevTasks => prevTasks.sort((a,b) => a.id - b.id)); 

        return updatedTasks;
    });

    
   
    
  }

  function randomID(){
    return Math.floor(Math.random() * 1000) + 1;
  }

  function assignTask(formData){
    event.preventDefault();
    console.log("submitted")
    const task_content = formData.get("task_content")
    const id = formData.get("id")
    // console.log(task_content)

    
    setTasks(prevTask => prevTask.map(item => {
      return item.id === id ? {...item, task_entry: task_content} : item
    }))
      
  }

  function handleChange(id){
    const changed_content = event.target.value
     setTasks(prevTask => prevTask.map(item => {
      return item.id === id ? {...item, task_entry: changed_content} : item
    }))
  }

  const taskElements = tasks.map(task => (
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

  function addTask() {
    const empty_task_id = findEmptyTaskID();
    if(!empty_task_id){
      setTasks(prevTask => [...prevTask, 
        {id: tasks.length + 1, 
          task_entry: ``, 
          done: false}] 
        )
    }


   setTasks(prevTasks => prevTasks.sort((a,b) => a.id - b.id)); 
    
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
          console.log("GOD")
          addTask();
        }
    };
  document.addEventListener('keydown', handleKeyPress);

  return () => {
      document.removeEventListener('keydown', handleKeyPress);}
  }, [tasks, addTask]);
  

  function removeTask(id) {
    setTasks(prevTasks => prevTasks.filter(item => item.id !== id));
    console.log(`Deleted ID: ${id}`)
    console.log(tasks)
}
  function findEmptyTaskID(){
    return tasks.find(item => item.task_entry === '')?.id;
  }
      
  // auto delete task component functionality of cursor clicks off screen while textbox is empty
  React.useEffect(() => {
    setTasks(prevTasks => prevTasks.sort((a,b) => a.id - b.id));

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

    console.log("Updated tasks:", tasks);}

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