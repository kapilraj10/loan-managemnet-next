"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Loan } from "@/lib/models/loan"
import { LoanForm } from "./loan-form"

interface LoanTableProps {
  loans: Loan[]
  onUpdate: (id: string, data: any) => Promise<void>
  onDelete: (id: string) => Promise<void>
  loading?: boolean
}

export function LoanTable({ loans, onUpdate, onDelete, loading }: LoanTableProps) {
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<string>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const handleEdit = (loan: Loan) => {
    setEditingLoan(loan)
  }

  const handleUpdate = async (data: any) => {
    if (!editingLoan?._id) return
    await onUpdate(editingLoan._id.toString(), data)
    setEditingLoan(null)
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await onDelete(id)
    } finally {
      setDeletingId(null)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const filteredAndSortedLoans = loans
    .filter(
      (loan) =>
        loan.loanName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.createdBy.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof Loan]
      let bValue: any = b[sortBy as keyof Loan]

      if (sortBy === "createdAt") {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  if (editingLoan) {
    return (
      <LoanForm
        onSubmit={handleUpdate}
        initialData={editingLoan}
        isEditing={true}
        onCancel={() => setEditingLoan(null)}
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="font-bold text-xl">Loan Management</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Search loans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="interestRate">Interest Rate</SelectItem>
                <SelectItem value="remainingAmount">Remaining</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="w-full sm:w-auto"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-muted-foreground">Loading loans...</span>
            </div>
          </div>
        ) : filteredAndSortedLoans.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-muted-foreground mb-2">{searchTerm ? "No loans match your search" : "No loans found"}</p>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? "Try adjusting your search terms" : "Create your first loan above"}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">S.N</TableHead>
                    <TableHead>Loan Name</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Duration</TableHead>
                    <TableHead className="text-right">Interest Rate</TableHead>
                    <TableHead className="text-right">Paid Amount</TableHead>
                    <TableHead className="text-right">Remaining Amount</TableHead>
                    <TableHead className="text-right">Total Interest</TableHead>
                    <TableHead className="text-right">Total Payable</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedLoans.map((loan, index) => (
                    <TableRow key={loan._id?.toString()} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">{loan.loanName}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(loan.amount)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{loan.duration} months</Badge>
                      </TableCell>
                      <TableCell className="text-right">{loan.interestRate}%</TableCell>
                      <TableCell className="text-right text-primary font-semibold">
                        {formatCurrency(loan.paidAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            loan.remainingAmount > 0 ? "text-destructive font-semibold" : "text-primary font-semibold"
                          }
                        >
                          {formatCurrency(loan.remainingAmount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(loan.totalInterest)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(loan.totalPayable)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{loan.createdBy}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(loan.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(loan)}
                            className="hover:bg-primary hover:text-primary-foreground"
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(loan._id?.toString() || "")}
                            disabled={deletingId === loan._id?.toString()}
                            className="hover:bg-destructive/90"
                          >
                            {deletingId === loan._id?.toString() ? "..." : "Delete"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="lg:hidden space-y-4">
              {filteredAndSortedLoans.map((loan, index) => (
                <Card key={loan._id?.toString()} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{loan.loanName}</h3>
                        <p className="text-sm text-muted-foreground">#{index + 1}</p>
                      </div>
                      <Badge variant="secondary">{loan.duration} months</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <p className="font-semibold">{formatCurrency(loan.amount)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Interest Rate:</span>
                        <p className="font-semibold">{loan.interestRate}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Paid:</span>
                        <p className="font-semibold text-primary">{formatCurrency(loan.paidAmount)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Remaining:</span>
                        <p
                          className={`font-semibold  रु{loan.remainingAmount > 0 ? "text-destructive" : "text-primary"}`}
                        >
                          {formatCurrency(loan.remainingAmount)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Interest:</span>
                        <p className="font-semibold">{formatCurrency(loan.totalInterest)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Payable:</span>
                        <p className="font-semibold">{formatCurrency(loan.totalPayable)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="text-xs text-muted-foreground">
                        <p>
                          By:{" "}
                          <Badge variant="outline" className="text-xs">
                            {loan.createdBy}
                          </Badge>
                        </p>
                        <p className="mt-1">{formatDate(loan.createdAt)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(loan)}
                          className="hover:bg-primary hover:text-primary-foreground"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(loan._id?.toString() || "")}
                          disabled={deletingId === loan._id?.toString()}
                          className="hover:bg-destructive/90"
                        >
                          {deletingId === loan._id?.toString() ? "..." : "Delete"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
