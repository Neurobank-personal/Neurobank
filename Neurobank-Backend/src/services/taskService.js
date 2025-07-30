const dataService = require("./dataService");
const { v4: uuidv4 } = require("uuid");

class TaskService {
  async getAllTasks() {
    return await dataService.getTasks();
  }

  async saveTasks(tasks) {
    return await dataService.saveTasks(tasks);
  }

  async getUserTasks(userId) {
    const tasks = await this.getAllTasks();
    return tasks.filter((task) => task.userId === userId);
  }

  async getTaskById(taskId) {
    const tasks = await this.getAllTasks();
    return tasks.find((task) => task.id === taskId);
  }

  async createTask(taskData) {
    const tasks = await this.getAllTasks();

    const newTask = {
      id: uuidv4(),
      userId: taskData.userId,
      title: taskData.title,
      description: taskData.description || "",
      priority: taskData.priority || "medium",
      status: "pending",
      createdAt: new Date().toISOString(),
      dueDate: taskData.dueDate || null,
      completedAt: null,
    };

    tasks.push(newTask);
    await this.saveTasks(tasks);
    return newTask;
  }

  async updateTask(taskId, updates) {
    const tasks = await this.getAllTasks();
    const taskIndex = tasks.findIndex((task) => task.id === taskId);

    if (taskIndex === -1) {
      throw new Error("Task not found");
    }

    const updatedTask = {
      ...tasks[taskIndex],
      ...updates,
    };

    // If status is being changed to completed, set completedAt
    if (
      updates.status === "completed" &&
      tasks[taskIndex].status !== "completed"
    ) {
      updatedTask.completedAt = new Date().toISOString();
    }

    // If status is being changed from completed to pending, clear completedAt
    if (
      updates.status === "pending" &&
      tasks[taskIndex].status === "completed"
    ) {
      updatedTask.completedAt = null;
    }

    tasks[taskIndex] = updatedTask;
    await this.saveTasks(tasks);
    return updatedTask;
  }

  async deleteTask(taskId) {
    const tasks = await this.getAllTasks();
    const taskIndex = tasks.findIndex((task) => task.id === taskId);

    if (taskIndex === -1) {
      throw new Error("Task not found");
    }

    tasks.splice(taskIndex, 1);
    await this.saveTasks(tasks);
    return true;
  }
}

module.exports = TaskService;
