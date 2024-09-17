
import { createId } from "@paralleldrive/cuid2";
import { File, User } from "./types";

export const SESSIONS = new Map<string, string>([]);

export const USERS = new Map<string, User>([["default", { username: "default", password: "default" }]]);

export const FILES = new Map<string, File[]>([
    ["default", []]
]);

export const API_KEYS = ["fe93ced5bb7c2f401b4396ae5f380d8b"];