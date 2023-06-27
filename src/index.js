const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username)

  if(!user) {
    return response.status(404).json({error: "user not found!"})
  }

  request.user = user;

  return next();
}

// criando uma conta
app.post('/users', (request, response) => {
  const { name, username } = request.body;

  // verificando se usuário já existe
  const userAlreadyExists = users.find( user => user.username === username)

  if(userAlreadyExists) {
    return response.status(400).json({error: "user already exists!"})
  }

  const user = {
    name,
    username,
    id: uuidv4(),
    todos: []
  };

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  
  user.todos.push(todo)

  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const checkTodo = user.todos.find(todo => todo.id === id)

  if(!checkTodo) {
    return response.status(404).json({error: "Todo not found"})
  }

  checkTodo.title = title;
  checkTodo.deadline = new Date(deadline)

  return response.json(checkTodo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const checkTodo = user.todos.find(todo => todo.id === id)

  if(!checkTodo) {
    return response.status(404).json({error: "Todo not found"})
  }

  checkTodo.done =  true;

  return response.json(checkTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  // se findIndex retorna -1 quer dizer que o elemento nao foi encontrado
  if(todoIndex === -1) {
    return response.status(404).json({error: "Todo not found"})
  }

  user.todos.splice(todoIndex, 1)

  return response.status(204).send()
});

module.exports = app;