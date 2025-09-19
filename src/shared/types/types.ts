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