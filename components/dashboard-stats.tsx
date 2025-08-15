"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Loan } from "@/lib/models/loan"

interface DashboardStatsProps {
  loans: Loan[]
  loading?: boolean
}

export function DashboardStats({ loans, loading }: DashboardStatsProps) {
  const totalLoans = loans.length
  const totalAmount = loans.reduce((sum, loan) => sum + loan.amount, 0)
  const totalPaid = loans.reduce((sum, loan) => sum + loan.paidAmount, 0)
  const totalRemaining = loans.reduce((sum, loan) => sum + loan.remainingAmount, 0)
  const totalInterest = loans.reduce((sum, loan) => sum + loan.totalInterest, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const stats = [
    {
      title: "Total Loans",
      value: totalLoans.toString(),
      description: "Active loans in system",
      icon: "",
    },
    {
      title: "Total Loan Amount",
      value: formatCurrency(totalAmount),
      description: "Principal amount loaned",
      icon: "",
    },
    {
      title: "Total Paid",
      value: formatCurrency(totalPaid),
      description: "Amount received so far",
      icon: "",
    },
    {
      title: "Total Remaining",
      value: formatCurrency(totalRemaining),
      description: "Outstanding balance",
      icon: "",
    },
    {
      title: "Total Interest",
      value: formatCurrency(totalInterest),
      description: "Interest to be earned",
      icon: "",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className="text-lg">{stat.icon}</span>
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <div className="h-8 bg-muted animate-pulse rounded"></div>
                <div className="h-3 bg-muted animate-pulse rounded w-3/4"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-primary mb-1 break-all">{stat.value}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{stat.description}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
