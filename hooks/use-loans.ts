"use client"

import { useState, useEffect } from "react"
import type { Loan } from "@/lib/models/loan"
import { useAuth } from "@/contexts/auth-context"

export function useLoans() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { token } = useAuth()

  const getAuthHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const fetchLoans = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/loans", {
        headers: getAuthHeaders(),
      })
      if (!response.ok) {
        throw new Error("Failed to fetch loans")
      }
      const data = await response.json()
      setLoans(data.loans)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const createLoan = async (loanData: {
    loanName: string
    amount: number
    duration: number
    interestRate: number
    paidAmount?: number
  }) => {
    try {
      const response = await fetch("/api/loans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(loanData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create loan")
      }

      const data = await response.json()
      setLoans((prev) => [data.loan, ...prev])
      return data.loan
    } catch (err) {
      throw err
    }
  }

  const updateLoan = async (
    id: string,
    loanData: {
      loanName: string
      amount: number
      duration: number
      interestRate: number
      paidAmount?: number
    },
  ) => {
    try {
      const response = await fetch(`/api/loans/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(loanData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update loan")
      }

      const data = await response.json()
      setLoans((prev) => prev.map((loan) => (loan._id?.toString() === id ? data.loan : loan)))
      return data.loan
    } catch (err) {
      throw err
    }
  }

  const deleteLoan = async (id: string) => {
    try {
      const response = await fetch(`/api/loans/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete loan")
      }

      setLoans((prev) => prev.filter((loan) => loan._id?.toString() !== id))
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchLoans()
  }, [token]) // Refetch when token changes

  return {
    loans,
    loading,
    error,
    createLoan,
    updateLoan,
    deleteLoan,
    refetch: fetchLoans,
  }
}
