"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Loan } from "@/lib/models/loan"

interface LoanFormProps {
  onSubmit: (data: {
    loanName: string
    amount: number
    duration: number
    interestRate: number
    paidAmount?: number
  }) => Promise<void>
  initialData?: Loan
  isEditing?: boolean
  onCancel?: () => void
}

export function LoanForm({ onSubmit, initialData, isEditing = false, onCancel }: LoanFormProps) {
  const [formData, setFormData] = useState({
    loanName: initialData?.loanName || "",
    amount: initialData?.amount?.toString() || "",
    duration: initialData?.duration?.toString() || "",
    interestRate: initialData?.interestRate?.toString() || "",
    paidAmount: initialData?.paidAmount?.toString() || "0",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await onSubmit({
        loanName: formData.loanName,
        amount: Number.parseFloat(formData.amount),
        duration: Number.parseInt(formData.duration),
        interestRate: Number.parseFloat(formData.interestRate),
        paidAmount: Number.parseFloat(formData.paidAmount) || 0,
      })

      if (!isEditing) {
        setFormData({
          loanName: "",
          amount: "",
          duration: "",
          interestRate: "",
          paidAmount: "0",
        })
        setTouched({})
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const getFieldError = (field: string, value: string) => {
    if (!touched[field]) return ""

    switch (field) {
      case "loanName":
        return !value.trim() ? "Loan name is required" : ""
      case "amount":
        const amount = Number.parseFloat(value)
        return !value || isNaN(amount) || amount <= 0 ? "Valid amount is required" : ""
      case "duration":
        const duration = Number.parseInt(value)
        return !value || isNaN(duration) || duration <= 0 ? "Valid duration is required" : ""
      case "interestRate":
        const rate = Number.parseFloat(value)
        return !value || isNaN(rate) || rate < 0 ? "Valid interest rate is required" : ""
      default:
        return ""
    }
  }

  // Calculate preview values
  const amount = Number.parseFloat(formData.amount) || 0
  const interestRate = Number.parseFloat(formData.interestRate) || 0
  const paidAmount = Number.parseFloat(formData.paidAmount) || 0
  const totalInterest = (amount * interestRate) / 100
  const totalPayable = amount + totalInterest
  const remainingAmount = totalPayable - paidAmount

  const hasErrors = Object.keys(formData).some((field) =>
    getFieldError(field, formData[field as keyof typeof formData]),
  )

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-bold text-xl flex items-center gap-2">
          <span className="text-2xl">{isEditing ? "✏️" : "➕"}</span>
          {isEditing ? "Edit Loan" : "Create New Loan"}
        </CardTitle>
        <CardDescription>
          {isEditing ? "Update loan information" : "Enter loan details to create a new loan"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="loanName" className="text-sm font-medium">
                Loan Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="loanName"
                type="text"
                value={formData.loanName}
                onChange={(e) => handleChange("loanName", e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, loanName: true }))}
                placeholder="Enter loan name"
                className={getFieldError("loanName", formData.loanName) ? "border-destructive" : ""}
                required
              />
              {getFieldError("loanName", formData.loanName) && (
                <p className="text-sm text-destructive">{getFieldError("loanName", formData.loanName)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">
                Amount <span className="text-destructive">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, amount: true }))}
                placeholder="Enter loan amount"
                className={getFieldError("amount", formData.amount) ? "border-destructive" : ""}
                required
              />
              {getFieldError("amount", formData.amount) && (
                <p className="text-sm text-destructive">{getFieldError("amount", formData.amount)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm font-medium">
                Duration (months) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, duration: true }))}
                placeholder="Enter duration in months"
                className={getFieldError("duration", formData.duration) ? "border-destructive" : ""}
                required
              />
              {getFieldError("duration", formData.duration) && (
                <p className="text-sm text-destructive">{getFieldError("duration", formData.duration)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="interestRate" className="text-sm font-medium">
                Interest Rate (%) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="interestRate"
                type="number"
                step="0.01"
                min="0"
                value={formData.interestRate}
                onChange={(e) => handleChange("interestRate", e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, interestRate: true }))}
                placeholder="Enter interest rate"
                className={getFieldError("interestRate", formData.interestRate) ? "border-destructive" : ""}
                required
              />
              {getFieldError("interestRate", formData.interestRate) && (
                <p className="text-sm text-destructive">{getFieldError("interestRate", formData.interestRate)}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="paidAmount" className="text-sm font-medium">
                Paid Amount
              </Label>
              <Input
                id="paidAmount"
                type="number"
                step="0.01"
                min="0"
                value={formData.paidAmount}
                onChange={(e) => handleChange("paidAmount", e.target.value)}
                placeholder="Enter paid amount"
                className="md:max-w-xs"
              />
            </div>
          </div>

          {amount > 0 && (
            <div className="mt-6 p-6 bg-muted/50 rounded-lg border border-border">
              <h3 className="font-semibold mb-4 text-muted-foreground flex items-center gap-2">
                <span className="text-lg"></span>
                Calculated Values
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-background rounded-lg border border-border">
                  <span className="text-sm text-muted-foreground block mb-1">Total Interest</span>
                  <p className="text-xl font-bold text-primary"> रु{totalInterest.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-background rounded-lg border border-border">
                  <span className="text-sm text-muted-foreground block mb-1">Total Payable</span>
                  <p className="text-xl font-bold text-primary"> रु{totalPayable.toFixed(2)}</p>
                </div>
                <div className="text-center p-4 bg-background rounded-lg border border-border">
                  <span className="text-sm text-muted-foreground block mb-1">Remaining Amount</span>
                  <p className={`text-xl font-bold  रु{remainingAmount > 0 ? "text-destructive" : "text-primary"}`}>
                     रु{remainingAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button type="submit" disabled={loading || hasErrors} className="flex-1 h-12 text-base font-medium">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : isEditing ? (
                "Update Loan"
              ) : (
                "Create Loan"
              )}
            </Button>
            {isEditing && onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="h-12 text-base bg-transparent">
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
