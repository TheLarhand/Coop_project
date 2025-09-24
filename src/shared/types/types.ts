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
    description: string;
    deadline: string;
    status: "in work" | "completed" | "failed";
    author: string;
}
