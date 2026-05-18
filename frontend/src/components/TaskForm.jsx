export default function TaskForm({ title, description, onTitleChange, onDescriptionChange, onSubmit, submitLabel, isEditing }) {
  return (
    <form className="task-form" onSubmit={onSubmit}>
      <label className="field-label" htmlFor="task-title">
        Task name
      </label>
      <div className="task-form-row">
        <input
          id="task-title"
          className="task-input"
          type="text"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Enter a task title"
          maxLength="120"
        />
        <button className="primary-button" type="submit">
          {isEditing ? submitLabel : 'Create task'}
        </button>
      </div>

      <label className="field-label" htmlFor="task-description">Description (optional)</label>
      <textarea
        id="task-description"
        className="task-input"
        value={description}
        onChange={(event) => onDescriptionChange(event.target.value)}
        placeholder="Add an optional description"
        rows={4}
        maxLength={800}
      />
    </form>
  );
}
