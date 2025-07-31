export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "completed";
  createdAt: string;
  completedAt?: string | undefined;
  dueDate?: string | null | undefined;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  dueDate?: string | null | undefined;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  status?: "pending" | "completed";
  dueDate?: string | null | undefined;
  completedAt?: string | undefined;
}