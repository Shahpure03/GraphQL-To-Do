// schema.js
const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Todo {
    id: ID!
    task: String!
    completed: Boolean!
    priority: String!
  }

  type Query {
    getTodos: [Todo]
  }

  type Mutation {
    addTodo(task: String!, priority: String!): Todo
    deleteTodo(id: ID!): ID
    toggleTodo(id: ID!): Todo
  }
`;

const todos = [];

const resolvers = {
  Query: {
    getTodos: () => todos
  },
  Mutation: {
    addTodo: (_, { task, priority }) => {
      const newTodo = {
        id: Date.now().toString(),
        task,
        priority,
        completed: false
      };
      todos.push(newTodo);
      return newTodo;
    },
    deleteTodo: (_, { id }) => {
      const index = todos.findIndex(todo => todo.id === id);
      if (index > -1) {
        todos.splice(index, 1);
        return id;
      }
      return null;
    },
    toggleTodo: (_, { id }) => {
      const todo = todos.find(t => t.id === id);
      if (todo) {
        todo.completed = !todo.completed;
      }
      return todo;
    }
  }
};

module.exports = { typeDefs, resolvers };
