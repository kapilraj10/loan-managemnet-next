import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getDatabase } from "@/lib/mongodb"
import { type Loan } from "@/lib/models/loan"
import { getUserFromToken } from "@/lib/auth"

// Helper function to calculate simple interest (consistent with POST method)
function calculateLoan(amount: number, interestRate: number, duration: number) {
  const totalInterest = (amount * interestRate * duration) / 100
  const totalAmount = amount + totalInterest
  return { totalInterest, totalAmount }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { loanName, amount, duration, interestRate, paidAmount } = body

    // Validate loan ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid loan ID" }, { status: 400 })
    }

    // Validate required fields
    const errors = []
    if (!loanName) errors.push("loanName is required")
    if (amount === undefined) errors.push("amount is required")
    if (duration === undefined) errors.push("duration is required")
    if (interestRate === undefined) errors.push("interestRate is required")
    
    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(", ") }, { status: 400 })
    }

    // Validate field types and constraints
    if (typeof amount !== "number" || amount <= 0) {
      errors.push("Amount must be a positive number")
    }
    if (typeof interestRate !== "number" || interestRate < 0) {
      errors.push("Interest rate must be a non-negative number")
    }
    if (typeof duration !== "number" || duration <= 0) {
      errors.push("Duration must be a positive number")
    }
    if (paidAmount !== undefined && (typeof paidAmount !== "number" || paidAmount < 0)) {
      errors.push("Paid amount must be a non-negative number")
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(", ") }, { status: 400 })
    }

    // Get user from token
    const authHeader = request.headers.get("authorization")
    const user = getUserFromToken(authHeader)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const loans = db.collection<Loan>("loans")

    // Find loan owned by current user
    const query = { _id: new ObjectId(id), createdBy: user.userId }
    const existingLoan = await loans.findOne(query)
    
    if (!existingLoan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 })
    }

    // Recalculate loan values
    const { totalInterest, totalAmount } = calculateLoan(
      amount,
      interestRate,
      duration
    )

    // Calculate remaining amount
    const finalPaidAmount = paidAmount ?? existingLoan.paidAmount
    const remainingAmount = Math.max(0, totalAmount - finalPaidAmount)

    const updateData = {
      loanName,
      amount,
      duration,
      interestRate,
      paidAmount: finalPaidAmount,
      totalInterest,
      totalAmount,
      remainingAmount,
      updatedAt: new Date(),
    }

    // Update loan in database
    const result = await loans.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 })
    }

    const updatedLoan = await loans.findOne({ _id: new ObjectId(id) })
    return NextResponse.json({ loan: updatedLoan })

  } catch (error) {
    console.error("Error updating loan:", error)
    return NextResponse.json({ error: "Failed to update loan" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid loan ID" }, { status: 400 })
    }

    // Get user from token
    const authHeader = request.headers.get("authorization")
    const user = getUserFromToken(authHeader)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const loans = db.collection<Loan>("loans")

    // Delete loan owned by current user
    const query = { _id: new ObjectId(id), createdBy: user.userId }
    const result = await loans.deleteOne(query)
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Loan deleted successfully" })

  } catch (error) {
    console.error("Error deleting loan:", error)
    return NextResponse.json({ error: "Failed to delete loan" }, { status: 500 })
  }
}
