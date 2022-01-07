const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const foundUser = users.find((user) => user.username === username);

  if (foundUser) {
    request.user = foundUser;
    next();
  } else {
    response.status(404).json({ error: "Usuário com username não encontrado" });
  }
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const doesUsernameExist = users.some((user) => user.username === username);

  if (doesUsernameExist) {
    return response
      .status(400)
      .json({ error: "Usuário com o mesmo username já existe" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  response.json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  response.json(request.user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodo);

  response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;

  const foundTodoIndex = user.todos.findIndex((todo) => todo.id === id);
  if (foundTodoIndex === -1) {
    return response.status(404).json({ error: "Tarefa não existente" });
  } else {
    user.todos[foundTodoIndex] = {
      ...user.todos[foundTodoIndex],
      title,
      deadline: new Date(deadline),
    };

    response.json(user.todos[foundTodoIndex]);
  }
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const foundTodoIndex = user.todos.findIndex((todo) => todo.id === id);
  if (foundTodoIndex === -1) {
    return response.status(404).json({ error: "Tarefa não existente" });
  } else {
    user.todos[foundTodoIndex] = {
      ...user.todos[foundTodoIndex],
      done: true,
    };

    response.json(user.todos[foundTodoIndex]);
  }
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const foundTodoIndex = user.todos.findIndex((todo) => todo.id === id);
  if (foundTodoIndex === -1) {
    return response.status(404).json({ error: "Tarefa não existente" });
  } else {
    user.todos.splice(foundTodoIndex, 1);

    response.status(204).send();
  }
});

module.exports = app;
