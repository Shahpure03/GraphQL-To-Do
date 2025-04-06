const todos = [];
let idCounter = 1;

const resolvers = {
  Query: {
    getTodos: (_, args) => {
      let filtered = todos;

      if (args.status !== undefined) {
        filtered = filtered.filter(todo => todo.completed === args.status);
      }

      if (args.priority) {
        filtered = filtered.filter(todo => todo.priority === args.priority);
      }

      // Sort: Incomplete first, then by priority (HIGH → LOW)
      filtered.sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      return filtered;
    },
  },

  Mutation: {
    addTodo: (_, { task, priority }) => {
      const newTodo = {
        id: String(idCounter++),
        task,
        completed: false,
        priority,
      };
      todos.push(newTodo);
      return newTodo;
    },

    deleteTodo: (_, { id }) => {
      const index = todos.findIndex(todo => todo.id === id);
      if (index > -1) {
        const removed = todos.splice(index, 1)[0];
        return removed;
      }
      throw new Error("Todo not found");
    },

    toggleTodo: (_, { id }) => {
      const todo = todos.find(todo => todo.id === id);
      if (todo) {
        todo.completed = !todo.completed;
        return todo;
      }
      throw new Error("Todo not found");
    },
  },
};

module.exports = resolvers;
