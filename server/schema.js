const { gql } = require('apollo-server-express');

const typeDefs = gql`
  enum Priority {
    HIGH
    MEDIUM
    LOW
  }

  type Todo {
    id: ID!
    task: String!
    completed: Boolean!
    priority: Priority!
  }

  type Task {
    id: ID!
    title: String!
    description: String
    completed: Boolean!
    createdAt: String!
    updatedAt: String!
    streak: Int
    points: Int
  }

  type Query {
    getTodos(status: Boolean, priority: Priority): [Todo!]!
    getTasks(completed: Boolean): [Task!]!
  }

  type Mutation {
    addTodo(task: String!, priority: Priority!): Todo!
    deleteTodo(id: ID!): Boolean!
    toggleTodo(id: ID!): Todo!
    addTask(title: String!, description: String, completed: Boolean!): Task!
    deleteTask(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;
