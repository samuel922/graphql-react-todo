import { gql, useMutation, useQuery } from "@apollo/client"
import { useState } from "react";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

const GET_TODOS = gql`
  query getTodos {
    todos {
      id
      title
      is_completed
    }
  }

`;

const TOGGLE_TODO = gql`
  mutation toggleTodos($id: uuid!, $is_completed: Boolean!) {
    update_todos(where: {id: {_eq: $id}}, _set: {is_completed: $is_completed}) {
      returning {
        id
        title
        is_completed
      }
    }
  }
`;

const ADD_TODO = gql`
    mutation AddTodo($todo: String!) {
      insert_todos(objects: {title: $todo}) {
        returning {
          is_completed
          title
        }
      }
    }
`;

const DELETE_TODO = gql`
  mutation deleteTodo($id: uuid!) {
    delete_todos(where: {id: {_eq: $id}}) {
      returning {
        id
        is_completed
        title
      }
    }
  }
`;

function App() {
  const [todoText, setTodoText] = useState("");
  const { data, loading, error } = useQuery(GET_TODOS);
  const [toggleTodo] = useMutation(TOGGLE_TODO);
  const [createTodo] = useMutation(ADD_TODO, {
    onCompleted: () => setTodoText("")
  });
  const [deleteTodo] = useMutation(DELETE_TODO);

  const handleToggleTodo = async ({ id, is_completed }) => {
    await toggleTodo({ variables: { id, is_completed: !is_completed } });
  }

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!todoText.trim()) return;

    await createTodo({ 
      variables: { todo: todoText },
      refetchQueries: [
        { query: GET_TODOS }
      ]
    });

    // setTodoText("");
  }

  const handleDeleteTodo = ({ id }) => {
    // Show sweeralert confirmation before deleting todo
    MySwal.fire({
      title: 'Are you sure',
      text: 'You will not be able to recover this todo!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then(result => {
      if (result.isConfirmed) {
        deleteTodo({
          variables: { id },
          update: cache => {
            const prevData = cache.readQuery({ query: GET_TODOS });
            const newTodos = prevData.todos.filter(todo => todo.id !== id);
            cache.writeQuery({ query: GET_TODOS, data: { todos: newTodos } })
          }
        })
      }
    })
    
  }

  if (loading) {
    return <div>Loading todos...</div>
  }

  if (error) {
    return <div>Error loading todos!!!</div>
  }
  return (
    <div className="bg-emerald-200 font-mono w-screen h-screen flex flex-col items-center justify-center gap-3">
      <h1 className="text-3xl text-slate-900 font-semibold text-center">React Todo App</h1>
      <div className="flex flex-col w-full items-center sm:w-full sm:flex-col gap-4 md:w-1/2 md:items-start md:justify-around">
        <form onSubmit={handleAddTodo} className="flex flex-col gap-2 md:flex-row">
          <input 
            type="text"
            placeholder="Write your todo"
            className="w-full focus:ring focus:ring-emerald-400"
            onChange={(e) => setTodoText(e.target.value)}
            value={todoText}
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Create</button>
        </form>

        <ul className="bg-white shadow-lg rounded-md w-3/4 [&>*:not(:last-child)]:border">
          {data.todos.map(todo => (
            <li key={todo.id} className={`flex flex-col gap-3 sm:justify-around sm:gap-4 p-4 md:flex-row`}>
                <input
                  type="checkbox"
                  className="focus:outline-none focus:ring-transparent rounded-full p-2 w-6 h-6"
                  checked={todo.is_completed}
                  onChange={() => handleToggleTodo(todo)}
                />
                <span className={todo.is_completed && 'line-through'}>{todo.title}</span>
                <button onClick={() => handleDeleteTodo(todo)} className="bg-blue-500 px-2 text-white rounded-md w-8 sm:w-8 sm:gap-4">&times;</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
export default App
