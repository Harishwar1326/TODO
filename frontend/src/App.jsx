import { useEffect, useState } from "react";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import { createTask, deleteTask, getTasks, updateTask } from "./api/tasks";

const emptyForm = {
  title: "",
  description: "",
  editingId: null,
};

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState({ loading: true, error: "" });

  useEffect(() => {
    let active = true;

    async function loadTasks() {
      try {
        const data = await getTasks();
        if (active) {
          setTasks(data);
          setStatus({ loading: false, error: "" });
        }
      } catch (error) {
        if (active) {
          setStatus({ loading: false, error: error.message });
        }
      }
    }

    loadTasks();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    const title = form.title.trim();
    const description = form.description ? form.description.trim() : "";
    if (!title) {
      return;
    }

    try {
      if (form.editingId) {
        const updatedTask = await updateTask(form.editingId, title, description);
        setTasks((currentTasks) => currentTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
      } else {
        const newTask = await createTask(title, description);
        setTasks((currentTasks) => [newTask, ...currentTasks]);
      }

      setForm(emptyForm);
      setStatus((current) => ({ ...current, error: "" }));
    } catch (error) {
      setStatus((current) => ({ ...current, error: error.message }));
    }
  }

  function handleEdit(task) {
    setForm({ title: task.title, description: task.description || "", editingId: task.id });
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Delete this task?");
    if (!confirmed) {
      return;
    }

    try {
      await deleteTask(id);
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
      setStatus((current) => ({ ...current, error: "" }));
    } catch (error) {
      setStatus((current) => ({ ...current, error: error.message }));
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Node.js + React CRUD</p>
        <h1>Todo Manager</h1>
        <p className="hero-copy">Create, read, update, and delete tasks using a tiny Node.js API and a React frontend.</p>
      </section>

      <section className="content-card">
        <TaskForm
          title={form.title}
          description={form.description}
          onTitleChange={(value) => setForm((current) => ({ ...current, title: value }))}
          onDescriptionChange={(value) => setForm((current) => ({ ...current, description: value }))}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
          isEditing={Boolean(form.editingId)}
        />

        {status.loading ? <p className="status-text">Loading tasks...</p> : null}
        {status.error ? <p className="error-text">{status.error}</p> : null}

        <TaskList tasks={tasks} onEdit={handleEdit} onDelete={handleDelete} />
      </section>
    </main>
  );
}
