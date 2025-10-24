import mongoose, { Schema } from "mongoose";

/**
 * Flexible line items for earnings/deductions so you can grow without schema changes.
 * Examples:
 *  earnings: [{ label: 'Basic', amount: 80000 }, { label: 'Housing', amount: 20000 }]
 *  deductions: [{ label: 'NHIF', amount: 1700 }, { label: 'Advance', amount: 5000 }]
 */
const moneyLineSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    code: { type: String, trim: true }, // optional internal code, e.g. "BASIC", "NHIF"
    taxable: { type: Boolean, default: true }, // for future tax calc logic
  },
  { _id: false }
);

const payrollSchema = new Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    // Lock a payroll to a specific month/year (or biweekly if you prefer)
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },

    // Optional: distinguish off-cycle runs (bonus, correction, etc.)
    runType: {
      type: String,
      enum: ["REGULAR", "BONUS", "ADJUSTMENT", "TERMINATION", "OTHER"],
      default: "REGULAR",
      index: true,
    },

    // Earnings & Deductions (flexible arrays)
    earnings: { type: [moneyLineSchema], default: [] },
    deductions: { type: [moneyLineSchema], default: [] },

    // Tax breakdown if you calculate it externally; store for audit
    taxes: {
      PAYE: { type: Number, default: 0, min: 0 },
      NSSF: { type: Number, default: 0, min: 0 },
      other: { type: Number, default: 0, min: 0 },
      total: { type: Number, default: 0, min: 0 },
    },

    // Totals for the run (auto-computed in pre-save if not provided)
    grossPay: { type: Number, default: 0, min: 0 },
    totalDeductions: { type: Number, default: 0, min: 0 },
    netPay: { type: Number, default: 0, min: 0 },

    currency: { type: String, default: "KES" },

    status: {
      type: String,
      enum: ["DRAFT", "APPROVED", "PAID", "VOID"],
      default: "DRAFT",
      index: true,
    },

    paymentDate: { type: Date }, // set when marked PAID
    notes: { type: String, trim: true },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true, // createdAt / updatedAt
  }
);

// Prevent multiple REGULAR payrolls for the same employee + month range
payrollSchema.index(
  { employee: 1, periodStart: 1, periodEnd: 1, runType: 1 },
  { unique: true, name: "uniq_employee_period_run" }
);

function sumLines(lines = []) {
  return lines.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
}

// Auto-compute totals before save if not explicitly set
payrollSchema.pre("save", function (next) {
  const doc = this;

  const gross = sumLines(doc.earnings);
  const dedBase = sumLines(doc.deductions);

  // Ensure taxes.total is consistent even if components are set
  const taxTotal = Number(doc.taxes?.PAYE || 0) +
                   Number(doc.taxes?.NSSF || 0) +
                   Number(doc.taxes?.other || 0);

  doc.grossPay = Number.isFinite(doc.grossPay) ? doc.grossPay : gross;
  doc.totalDeductions = Number.isFinite(doc.totalDeductions)
    ? doc.totalDeductions
    : dedBase + taxTotal;

  doc.taxes = {
    PAYE: Number(doc.taxes?.PAYE || 0),
    NSSF: Number(doc.taxes?.NSSF || 0),
    other: Number(doc.taxes?.other || 0),
    total: taxTotal,
  };

  doc.netPay = Number.isFinite(doc.netPay)
    ? doc.netPay
    : Math.max(0, doc.grossPay - doc.totalDeductions);

  next();
});

// ✅ Force model recompilation (handy in dev/watch mode)
delete mongoose.models.Payroll;
const Payroll = mongoose.model("Payroll", payrollSchema);

export default Payroll;
