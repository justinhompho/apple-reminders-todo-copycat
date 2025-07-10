export default function Task(props) {


  return (
    <div className="task">
        <div className="done-container">
      <button onClick={() => props.toggleDone(props.id)}
                className={`${props.done ? "done-filled" : undefined} done`}>
                <div className={`${props.done ? "filled" : undefined} unfilled`}></div>
                </button>
                </div>
      <form action={props.assignTask} >  
        <input type="hidden" name="id" value={props.id} />  {/*for handle change*/}
        <input type="text" 
            name="task_content"
            id={props.id}
            className={props.done ? "input-filled" : undefined}
            placeholder="New Task" 
            value = {props.task_entry} 
            onChange= {() => props.handleChange(props.id)}
            autoComplete="off"
            />
        </form>
    </div>
  );
}
