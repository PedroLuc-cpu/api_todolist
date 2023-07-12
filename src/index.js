const express = require('express');
const cors = require('cors');

const { v4: uuidv4,} = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(404).json({ error: 'O usuário não existe' });
  }

  request.user = user;

  return next();
}

function checksCreateTodosUserAvailability(request, response, next) {

 const VerifyIfPro = users.find(userPro => userPro.pro === false);
 const CheckIfYouHaveTenAll = users.map(checksLengthTodo => checksLengthTodo.todos.length);
 
 if(VerifyIfPro && CheckIfYouHaveTenAll < 10){
  return next()
 }
request.VerifyIfPro = VerifyIfPro;
request.CheckIfYouHaveTenAll = CheckIfYouHaveTenAll; 

return response.status(403).json({warning:"Para Cadastrar mais todo, assine plano PRO."});

}

function checksTodoExists(request, response, next) {
  const {username} =  request.headers;
  const {id} = request.params;

  const user = users.find(checksID => checksID.username === username); 

  if(!user){
    return response.status(404).json({erro: "Usuário não encontrado"})
  }

  if(!uuidv4.test(id)){
    return response.status(400).json({erro: "ID invalido"})
  }

  const todo = todos.find((todo) => todo.id === id && todo.username === username)
  if(!todo){
    return response.status(404).json({erro:"Todo não exite"})
  }

  request.user = user;
  request.todo = todo;

  return next();
}

function findUserById(request, response, next) {
  const {id} = request.params;
  
  const checkUserById = users.find((user) => user.id === id);

  if(!checkUserById){
    return response.status(404).json({erro:"O id deste usuário não existe."});
  }

  request.checkUserById = checkUserById;

   return next()
  
}


app.post('/users', (request, response) => {
  const { username, name } = request.body;

  const userAlreadyExists = users.find(user => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: 'Usuário já existe' });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    pro: false,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, checksTodoExists, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, checksCreateTodosUserAvailability, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount,checksTodoExists, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const checkTodo = user.todos.find(todo => todo.id === id);

  if (!checkTodo) {
    return response.status(404).json({ error: 'Todo não encontrado' });
  }

  checkTodo.title = title;
  checkTodo.deadline = new Date(deadline);

  return response.json(checkTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount,checksTodoExists, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const checkTodo = user.todos.find(todo => todo.id === id);

  if (!checkTodo) {
    return response.status(404).json({ error: 'Todo não encontrado' });
  }

  checkTodo.done = true;

  return response.json(checkTodo);
});

app.delete('/todos/:id', checksExistsUserAccount,checksTodoExists, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: 'Todo não encontrado' });
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports =
  app,
  users,
  checksExistsUserAccount,
  checksCreateTodosUserAvailability,
  checksTodoExists,
  findUserById;