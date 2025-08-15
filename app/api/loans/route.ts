import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { createLoanDocument, type Loan } from "@/lib/models/loan"
import { getUserFromToken } from "@/lib/auth"

// Helper function to calculate loan values
function calculateLoanValues(amount: number, interestRate: number, duration: number, paidAmount = 0) {
  const totalInterest = (amount * interestRate * duration) / 100
  const totalPayable = amount + totalInterest
  const remainingAmount = totalPayable - paidAmount
  return { totalInterest, totalPayable, remainingAmount }
}

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const loans = db.collection<Loan>("loans")

    const authHeader = request.headers.get("authorization")
    const user = getUserFromToken(authHeader)
    const query = user ? { createdBy: user.userId } : {}

    const loanList = await loans.find(query).sort({ createdAt: -1 }).toArray()
    return NextResponse.json({ loans: loanList })
  } catch (error) {
    console.error("Error fetching loans:", error)
    return NextResponse.json({ error: "Failed to fetch loans" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { loanName, amount, duration, interestRate } = body

    // Validation
    if (!loanName || amount === undefined || duration === undefined || interestRate === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (typeof amount !== "number" || typeof interestRate !== "number" || typeof duration !== "number") {
      return NextResponse.json({ error: "Amount, interest rate, and duration must be numbers" }, { status: 400 })
    }

    if (amount <= 0 || interestRate < 0 || duration <= 0) {
      return NextResponse.json({ error: "Amount, interest rate, and duration must be positive" }, { status: 400 })
    }

    // Calculate loan totals
    const { totalInterest, totalPayable, remainingAmount } = calculateLoanValues(amount, interestRate, duration, 0)

    // Get user from token or use default
    const authHeader = request.headers.get("authorization")
    const user = getUserFromToken(authHeader)
    const createdBy = user?.userId || "default-user"

    const db = await getDatabase()
    const loans = db.collection<Loan>("loans")

    const loanDocument = createLoanDocument({
      loanName,
      amount,
      duration,
      interestRate,
      paidAmount: 0,
      totalInterest,
      totalPayable,
      remainingAmount,
      createdBy,
    })

    const result = await loans.insertOne(loanDocument)
    const newLoan = await loans.findOne({ _id: result.insertedId })

    return NextResponse.json({ loan: newLoan }, { status: 201 })
  } catch (error) {
    console.error("Error creating loan:", error)
    return NextResponse.json({ error: "Failed to create loan" }, { status: 500 })
  }
}
