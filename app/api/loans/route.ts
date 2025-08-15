import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { createLoanDocument, type Loan } from "@/lib/models/loan"
import { getUserFromToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const loans = db.collection<Loan>("loans")

    // Get user from token (optional for single user, required for multi-user)
    const authHeader = request.headers.get("authorization")
    const user = getUserFromToken(authHeader)

    // For now, we'll support both single user (no auth) and multi-user (with auth)
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
    const { loanName, amount, duration, interestRate, paidAmount } = body

    // Validation
    if (!loanName || !amount || !duration || !interestRate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (typeof amount !== "number" || typeof interestRate !== "number" || amount <= 0 || interestRate < 0) {
      return NextResponse.json(
        { error: "Amount must be positive and interest rate must be non-negative" },
        { status: 400 },
      )
    }

    // Get user from token or use default user
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
      paidAmount: paidAmount || 0,
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
