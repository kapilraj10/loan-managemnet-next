"use client"

import { LoanForm } from "@/components/loan-form"
import { LoanTable } from "@/components/loan-table"
import { DashboardStats } from "@/components/dashboard-stats"
import { AuthForm } from "@/components/auth-form"
import { useLoans } from "@/hooks/use-loans"
import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function HomePage() {
  const { user, logout, loading: authLoading } = useAuth()
  const { loans, loading, error, createLoan, updateLoan, deleteLoan } = useLoans()
  const [showForm, setShowForm] = useState(false)

  const handleCreateLoan = async (data: any) => {
    await createLoan(data)
    setShowForm(false)
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-muted-foreground text-lg">Loading...</span>
        </div>
      </div>
    )
  }

  // Show auth form if not logged in
  if (!user) {
    return <AuthForm />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 py-4 lg:py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-3">
                <span className="text-3xl lg:text-4xl">🏦</span>
                <span className="break-words">Loan Management System</span>
              </h1>
              <p className="text-muted-foreground mt-1 text-sm lg:text-base">
                Manage your loans efficiently and professionally
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4">
              <div className="flex items-center gap-3 order-2 sm:order-1">
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Welcome back,</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm">
                      {user.name}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={logout} className="shrink-0 bg-transparent">
                  Logout
                </Button>
              </div>
              <Button
                onClick={() => setShowForm(!showForm)}
                className="bg-primary hover:bg-primary/90 order-1 sm:order-2 w-full sm:w-auto"
                size="lg"
              >
                {showForm ? "Hide Form" : "Add New Loan"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 lg:py-8">
        {error && (
          <div className="mb-6 p-4 text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-medium">Error occurred</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Dashboard Stats */}
        <DashboardStats loans={loans} loading={loading} />

        {/* Loan Form */}
        {showForm && (
          <div className="mb-8">
            <LoanForm onSubmit={handleCreateLoan} />
          </div>
        )}

        {/* Loan Table */}
        <LoanTable loans={loans} onUpdate={updateLoan} onDelete={deleteLoan} loading={loading} />
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">👨‍💻</span>
              <p className="text-sm lg:text-base">
                Developed by <span className="font-semibold text-primary">Kapil Raj</span>
              </p>
            </div>
            <a
              href="https://www.kapilrajkc.com.np"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm lg:text-base transition-colors"
            >
              www.kapilrajkc.com.np
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
