import type { ObjectId } from "mongodb"

export interface Loan {
  _id?: ObjectId
  loanName: string
  amount: number
  duration: number // in months
  interestRate: number // percentage
  paidAmount: number
  totalInterest: number
  totalPayable: number
  remainingAmount: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateLoanData {
  loanName: string
  amount: number
  duration: number
  interestRate: number
  paidAmount?: number
  createdBy: string
}

export function calculateLoanValues(amount: number, interestRate: number, paidAmount = 0) {
  const totalInterest = (amount * interestRate) / 100
  const totalPayable = amount + totalInterest
  const remainingAmount = totalPayable - paidAmount

  return {
    totalInterest,
    totalPayable,
    remainingAmount,
  }
}

export function createLoanDocument(data: CreateLoanData): Omit<Loan, "_id"> {
  const { totalInterest, totalPayable, remainingAmount } = calculateLoanValues(
    data.amount,
    data.interestRate,
    data.paidAmount || 0,
  )

  return {
    loanName: data.loanName,
    amount: data.amount,
    duration: data.duration,
    interestRate: data.interestRate,
    paidAmount: data.paidAmount || 0,
    totalInterest,
    totalPayable,
    remainingAmount,
    createdBy: data.createdBy,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}
