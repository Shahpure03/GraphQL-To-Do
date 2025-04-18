const { gql } = require("apollo-server-express");

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

  type Query {
    getTodos(status: Boolean, priority: Priority): [Todo!]!
  }

  type Mutation {
    addTodo(task: String!, priority: Priority!): Todo!
    toggleTodo(id: ID!): Todo!
    deleteTodo(id: ID!): Todo!
  }
`;

module.exports = typeDefs;
