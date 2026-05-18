export default function TaskList({ tasks, onEdit, onDelete }) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <h2>No tasks yet</h2>
        <p>Create your first task using the form above.</p>
      </div>
    );
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li key={task.id} className="task-item">
          <div>
            <p className="task-title">{task.title}</p>
            {task.description ? <p className="task-meta">{task.description}</p> : null}
            <p className="task-meta">Task ID: {task.id}</p>
          </div>
          <div className="task-actions">
            <button className="secondary-button" type="button" onClick={() => onEdit(task)}>
              Edit
            </button>
            <button className="danger-button" type="button" onClick={() => onDelete(task.id)}>
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
