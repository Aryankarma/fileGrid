// export type File = {
//     username: string,
//     filename: string
// }

export type File =  {
    id: string,
    encoding?: string;
    mimetype?: string;
    size: number;
    filename: string;
    path: string;
}


export type User = {
    username: string
    password: string
}