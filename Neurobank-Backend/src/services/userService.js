const dataService = require("./dataService");
const { validateUser } = require("../utils/validation");

class UserService {
  async getUsers() {
    return dataService.getUsers();
  }

  async saveUsers(users) {
    return dataService.saveUsers(users);
  }

  async getUserById(userId) {
    const users = await this.getUsers();
    return users.find((user) => user.id === userId);
  }

  async getUserByEmail(email) {
    const users = await this.getUsers();
    return users.find((user) => user.email === email);
  }

  async createUser(userData) {
    validateUser(userData);

    // Kolla om användaren redan finns
    const existingUser = await this.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error("Användare med denna e-post finns redan");
    }

    const newUser = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return dataService.createUser(newUser);
  }

  async updateUser(userId, updates) {
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return dataService.updateUser(userId, updatedData);
  }

  async deleteUser(userId) {
    return dataService.deleteUser(userId);
  }
}

module.exports = new UserService();
