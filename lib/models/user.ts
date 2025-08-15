import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  email: string
  password: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserData {
  email: string
  password: string
  name: string
}

export interface LoginData {
  email: string
  password: string
}

export function createUserDocument(data: CreateUserData): Omit<User, "_id"> {
  return {
    email: data.email.toLowerCase(),
    password: data.password, // Will be hashed before saving
    name: data.name,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}
