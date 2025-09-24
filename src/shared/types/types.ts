export interface User {
    id: number;
    name: string;
    ava: string | null;
}

export interface Credentials {
    username: string;
    password: string;
}

export interface Profile {
    name: string;
    ava: string;
}

/* ДОБАВИЛОСЬ: */
export interface UserStatistic {
    id: number;
    name: string;
    ava: string;
    completedTasks: number;
    inWorkTasks: number;
    failedTasks: number;
}

export interface MyStatistic {
    completedTasks: number;
    inWorkTasks: number;
    failedTasks: number;
}

export interface Task {
    id: string;
    name: string;
    description: string;
    assigneeId: string;
    deadline: string;
    creator: string;
}

export interface TaskCreatePayload {
  title: string;
  description: string;
  performer: number; 
  deadline: string;
}
