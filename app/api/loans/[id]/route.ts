import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getDatabase } from "@/lib/mongodb"
import { type Loan } from "@/lib/models/loan"
import { getUserFromToken } from "@/lib/auth"

// Helper function to calculate loan values
function calculateLoanValues(amount: number, interestRate: number, duration: number, paidAmount = 0) {
  const totalInterest = (amount * interestRate * duration) / 100
  const totalPayable = amount + totalInterest
  const remainingAmount = Math.max(0, totalPayable - paidAmount)
  return { totalInterest, totalPayable, remainingAmount }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { loanName, amount, duration, interestRate, paidAmount } = body

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid loan ID" }, { status: 400 })
    }

    // Get user from token
    const authHeader = request.headers.get("authorization")
    const user = getUserFromToken(authHeader)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const db = await getDatabase()
    const loans = db.collection<Loan>("loans")

    // Find loan owned by current user
    const existingLoan = await loans.findOne({ _id: new ObjectId(id), createdBy: user.userId })
    if (!existingLoan) return NextResponse.json({ error: "Loan not found" }, { status: 404 })

    // Determine updated values, fallback to existing if not provided
    const newAmount = amount ?? existingLoan.amount
    const newDuration = duration ?? existingLoan.duration
    const newInterestRate = interestRate ?? existingLoan.interestRate
    const newPaidAmount = paidAmount ?? existingLoan.paidAmount

    // Recalculate loan totals
    const { totalInterest, totalPayable, remainingAmount } = calculateLoanValues(
      newAmount,
      newInterestRate,
      newDuration,
      newPaidAmount
    )

    const updateData = {
      loanName: loanName ?? existingLoan.loanName,
      amount: newAmount,
      duration: newDuration,
      interestRate: newInterestRate,
      paidAmount: newPaidAmount,
      totalInterest,
      totalPayable,
      remainingAmount,
      updatedAt: new Date(),
    }

    await loans.updateOne({ _id: new ObjectId(id) }, { $set: updateData })
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
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid loan ID" }, { status: 400 })

    // Get user from token
    const authHeader = request.headers.get("authorization")
    const user = getUserFromToken(authHeader)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const db = await getDatabase()
    const loans = db.collection<Loan>("loans")

    const result = await loans.deleteOne({ _id: new ObjectId(id), createdBy: user.userId })
    if (result.deletedCount === 0) return NextResponse.json({ error: "Loan not found" }, { status: 404 })

    return NextResponse.json({ message: "Loan deleted successfully" })
  } catch (error) {
    console.error("Error deleting loan:", error)
    return NextResponse.json({ error: "Failed to delete loan" }, { status: 500 })
  }
}
