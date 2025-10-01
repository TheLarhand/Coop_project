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
    id: number;
    title: string;
    author: number;
    performer: number;
    deadline: string;
    status: string;
    description: string;
    result: string | null;
}

export interface TaskCreatePayload {
    title: string;
    description: string;
    performer: number;
    deadline: string;
}
