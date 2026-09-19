"use client";

// Importamos useState porque vamos a guardar la información de la lista.
// Este componente será interactivo, por eso necesitamos estado.
import { useEffect, useState } from "react";
import styles from "./page.module.css";

const STORAGE_KEY = "student-todo-tasks";
const TRASH_STORAGE_KEY = "student-todo-trash";

export default function Home() {
  // task guarda lo que el usuario escribe en el input.
  const [task, setTask] = useState("");

  // tasks guarda todas las tareas que se agregan a la lista.
  const [tasks, setTasks] = useState([
    { id: 1, text: "Aprender JSX", done: false },
    { id: 2, text: "Crear una función en JavaScript", done: true },
    { id: 3, text: "Probar la app en el navegador", done: false },
  ]);
  const [isTasksLoaded, setIsTasksLoaded] = useState(false);

  // deletedTasks guarda las tareas eliminadas (la "caneca").
  const [deletedTasks, setDeletedTasks] = useState([]);
  const [isTrashLoaded, setIsTrashLoaded] = useState(false);

  // showTrash controla si el panel de la caneca está abierto.
  const [showTrash, setShowTrash] = useState(false);

  // editingId guarda el id de la tarea que se está editando (null si ninguna).
  // editingText guarda el texto temporal mientras se edita.
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  // Cargamos tareas activas desde localStorage.
  useEffect(() => {
    const savedTasks = window.localStorage.getItem(STORAGE_KEY);

    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);

        if (Array.isArray(parsedTasks)) {
          setTasks(parsedTasks);
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    setIsTasksLoaded(true);
  }, []);

  // Cargamos tareas eliminadas desde localStorage.
  useEffect(() => {
    const savedTrash = window.localStorage.getItem(TRASH_STORAGE_KEY);

    if (savedTrash) {
      try {
        const parsedTrash = JSON.parse(savedTrash);

        if (Array.isArray(parsedTrash)) {
          setDeletedTasks(parsedTrash);
        }
      } catch {
        window.localStorage.removeItem(TRASH_STORAGE_KEY);
      }
    }

    setIsTrashLoaded(true);
  }, []);

  useEffect(() => {
    if (isTasksLoaded) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [isTasksLoaded, tasks]);

  useEffect(() => {
    if (isTrashLoaded) {
      window.localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(deletedTasks));
    }
  }, [isTrashLoaded, deletedTasks]);

  // filter guarda cuál filtro está activo: "all", "pending" o "completed".
  const [filter, setFilter] = useState("all");

  // Esta función se ejecuta cuando el usuario hace clic en "Agregar".
  const handleAddTask = () => {
    // Si el texto está vacío o solo tiene espacios, no agregamos nada.
    if (!task.trim()) {
      return;
    }

    // Creamos una nueva tarea con un id único y el texto limpio.
    const nuevaTarea = {
      id: Date.now(),
      text: task.trim(),
      done: false,
    };

    // setTasks recibe una función para mantener el estado anterior.
    setTasks((tareasAnteriores) => [nuevaTarea, ...tareasAnteriores]);

    // Limpiamos el input después de agregar la tarea.
    setTask("");
  };

  // Esta función marca o desmarca una tarea como completada.
  const handleToggleTask = (id) => {
    setTasks((tareasAnteriores) =>
      tareasAnteriores.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  };

  // Esta función mueve una tarea a la caneca en lugar de borrarla para siempre.
  const handleDeleteTask = (id) => {
    const tareaAEliminar = tasks.find((item) => item.id === id);

    if (!tareaAEliminar) return;

    // Quitamos la tarea de la lista activa.
    setTasks((tareasAnteriores) =>
      tareasAnteriores.filter((item) => item.id !== id)
    );

    // La agregamos a la caneca con la fecha de eliminación.
    setDeletedTasks((papeleraAnterior) => [
      { ...tareaAEliminar, deletedAt: Date.now() },
      ...papeleraAnterior,
    ]);
  };

  // Devuelve una tarea de la caneca a la lista activa.
  const handleRestoreTask = (id) => {
    const tareaARestaurar = deletedTasks.find((item) => item.id === id);

    if (!tareaARestaurar) return;

    setDeletedTasks((papeleraAnterior) =>
      papeleraAnterior.filter((item) => item.id !== id)
    );

    // Quitamos el campo deletedAt al restaurarla.
    const { deletedAt, ...tareaLimpia } = tareaARestaurar;
    setTasks((tareasAnteriores) => [tareaLimpia, ...tareasAnteriores]);
  };

  // Elimina una tarea de la caneca de forma permanente.
  const handlePermanentDelete = (id) => {
    setDeletedTasks((papeleraAnterior) =>
      papeleraAnterior.filter((item) => item.id !== id)
    );
  };

  // Vacía toda la caneca de una vez.
  const handleEmptyTrash = () => {
    setDeletedTasks([]);
  };

  // Activa el modo edición para una tarea específica.
  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditingText(item.text);
  };

  // Guarda el cambio y sale del modo edición.
  const handleSaveEdit = (id) => {
    if (!editingText.trim()) {
      // Si el usuario borra todo el texto, cancelamos la edición.
      setEditingId(null);
      return;
    }

    setTasks((tareasAnteriores) =>
      tareasAnteriores.map((item) =>
        item.id === id ? { ...item, text: editingText.trim() } : item
      )
    );

    setEditingId(null);
    setEditingText("");
  };

  // Cancela la edición sin guardar (por ejemplo, con Escape).
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  // Contamos cuántas tareas están completadas.
  const completedTasks = tasks.filter((item) => item.done).length;

  // Filtramos las tareas según el filtro seleccionado.
  const filteredTasks = tasks.filter((item) => {
    if (filter === "pending") return !item.done;
    if (filter === "completed") return item.done;
    return true; // "all" muestra todas
  });

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <p className={styles.eyebrow}>Organized mind</p>
            <h1>Lista de tareas</h1>
            <p className={styles.subtitle}>
              Escribe lo que debes hacer hoy y marca cada tarea cuando la completes.
            </p>
          </div>

          <div className={styles.stats}>
            <div className={styles.statBox}>
              <span className={styles.statNumber}>{tasks.length}</span>
              <span className={styles.statLabel}>Tareas</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statNumber}>{completedTasks}</span>
              <span className={styles.statLabel}>Completadas</span>
            </div>
          </div>
        </header>

        <div className={styles.inputRow}>
          <input
            type="text"
            value={task}
            placeholder="Ejemplo: Estudiar JavaScript"
            onChange={(event) => setTask(event.target.value)}
            onKeyDown={(event) => {
              // Si presiona Enter, agrega la tarea.
              if (event.key === "Enter") {
                handleAddTask();
              }
            }}
            aria-label="Nueva tarea"
          />

          <button type="button" onClick={handleAddTask}>
            Agregar
          </button>
        </div>

        <div className={styles.filters}>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={filter === "all" ? styles.activeFilter : ""}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => setFilter("pending")}
            className={filter === "pending" ? styles.activeFilter : ""}
          >
            Pendientes
          </button>
          <button
            type="button"
            onClick={() => setFilter("completed")}
            className={filter === "completed" ? styles.activeFilter : ""}
          >
            Completadas
          </button>
        </div>

        <ul className={styles.list}>
          {filteredTasks.length === 0 ? (
            <li className={styles.emptyState}>No hay tareas en este filtro.</li>
          ) : (
            filteredTasks.map((item) => (
              <li key={item.id} className={styles.taskItem}>
                <label className={styles.taskLabel}>
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => handleToggleTask(item.id)}
                  />

                  {editingId === item.id ? (
                    <input
                      type="text"
                      className={styles.editInput}
                      value={editingText}
                      autoFocus
                      onChange={(event) => setEditingText(event.target.value)}
                      onBlur={() => handleSaveEdit(item.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          handleSaveEdit(item.id);
                        }
                        if (event.key === "Escape") {
                          handleCancelEdit();
                        }
                      }}
                    />
                  ) : (
                    <span
                      className={item.done ? styles.completedText : ""}
                      onClick={(event) => {
                        event.preventDefault();
                        handleStartEdit(item);
                      }}
                    >
                      {item.text}
                    </span>
                  )}
                </label>

                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => handleDeleteTask(item.id)}
                  aria-label={`Eliminar la tarea ${item.text}`}
                >
                  Eliminar
                </button>
              </li>
            ))
          )}
        </ul>
      </section>

      {/* Botón flotante de la caneca / papelera */}
      <button
        type="button"
        className={styles.trashButton}
        onClick={() => setShowTrash(true)}
        aria-label="Ver tareas eliminadas"
      >
        <span className={styles.trashIcon}>🗑️</span>
        {deletedTasks.length > 0 && (
          <span className={styles.trashBadge}>{deletedTasks.length}</span>
        )}
      </button>

      {/* Panel/modal de la caneca con las tareas eliminadas */}
      {showTrash && (
        <div
          className={styles.trashOverlay}
          onClick={() => setShowTrash(false)}
        >
          <div
            className={styles.trashPanel}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.trashHeader}>
              <h2>🗑️ Tareas eliminadas</h2>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setShowTrash(false)}
                aria-label="Cerrar papelera"
              >
                ✕
              </button>
            </div>

            {deletedTasks.length === 0 ? (
              <p className={styles.emptyState}>La caneca está vacía.</p>
            ) : (
              <>
                <ul className={styles.list}>
                  {deletedTasks.map((item) => (
                    <li key={item.id} className={styles.taskItem}>
                      <span className={styles.completedText}>{item.text}</span>

                      <div className={styles.trashItemActions}>
                        <button
                          type="button"
                          className={styles.restoreButton}
                          onClick={() => handleRestoreTask(item.id)}
                        >
                          Restaurar
                        </button>
                        <button
                          type="button"
                          className={styles.deleteButton}
                          onClick={() => handlePermanentDelete(item.id)}
                        >
                          Eliminar definitivamente
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className={styles.emptyTrashButton}
                  onClick={handleEmptyTrash}
                >
                  Vaciar caneca
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}