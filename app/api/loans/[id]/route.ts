import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getDatabase } from "@/lib/mongodb"
import { type Loan, calculateLoanValues } from "@/lib/models/loan"
import { getUserFromToken } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { loanName, amount, duration, interestRate, paidAmount } = body

    // Validation
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid loan ID" }, { status: 400 })
    }
    if (!loanName || !amount || !duration || interestRate === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    if (typeof amount !== "number" || typeof interestRate !== "number" || typeof duration !== "number") {
      return NextResponse.json({ error: "Amount, interest rate, and duration must be numbers" }, { status: 400 })
    }

    const db = await getDatabase()
    const loans = db.collection<Loan>("loans")

    const authHeader = request.headers.get("authorization")
    const user = getUserFromToken(authHeader)
    const query = user ? { _id: new ObjectId(id), createdBy: user.userId } : { _id: new ObjectId(id) }

    const existingLoan = await loans.findOne(query)
    if (!existingLoan) return NextResponse.json({ error: "Loan not found" }, { status: 404 })

    // Recalculate loan totals
    const { totalInterest, totalPayable, remainingAmount } = calculateLoanValues(
      amount,
      interestRate,
      duration,
      paidAmount || 0
    )

    const updateData = {
      loanName,
      amount,
      duration,
      interestRate,
      paidAmount: paidAmount || 0,
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

    const db = await getDatabase()
    const loans = db.collection<Loan>("loans")

    const authHeader = request.headers.get("authorization")
    const user = getUserFromToken(authHeader)
    const query = user ? { _id: new ObjectId(id), createdBy: user.userId } : { _id: new ObjectId(id) }

    const result = await loans.deleteOne(query)
    if (result.deletedCount === 0) return NextResponse.json({ error: "Loan not found" }, { status: 404 })

    return NextResponse.json({ message: "Loan deleted successfully" })
  } catch (error) {
    console.error("Error deleting loan:", error)
    return NextResponse.json({ error: "Failed to delete loan" }, { status: 500 })
  }
}
