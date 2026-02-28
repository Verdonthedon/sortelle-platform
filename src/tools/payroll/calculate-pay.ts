// Canadian federal tax brackets 2024/2025
const FEDERAL_BRACKETS = [
  { max: 55867, rate: 0.15 },
  { max: 111733, rate: 0.205 },
  { max: 154906, rate: 0.26 },
  { max: 220000, rate: 0.29 },
  { max: Infinity, rate: 0.33 },
];

// CPP (Canada Pension Plan) 2024
const CPP = {
  rate: 0.0595,
  maxPensionableEarnings: 68500,
  basicExemption: 3500,
};

// EI (Employment Insurance) 2024
const EI = {
  rate: 0.0166,
  maxInsurableEarnings: 63200,
};

function calculateFederalTax(annualIncome: number): number {
  let tax = 0;
  let remaining = annualIncome;
  let prevMax = 0;

  for (const bracket of FEDERAL_BRACKETS) {
    const taxableInBracket = Math.min(remaining, bracket.max - prevMax);
    if (taxableInBracket <= 0) break;
    tax += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
    prevMax = bracket.max;
  }

  return tax;
}

export async function calculatePay(input: {
  grossPay: number;
  payFrequency: "biweekly" | "monthly" | "semi-monthly";
  province?: string;
}): Promise<string> {
  const { grossPay, payFrequency, province = "AB" } = input;

  const periodsPerYear =
    payFrequency === "biweekly" ? 26 : payFrequency === "semi-monthly" ? 24 : 12;
  const annualizedIncome = grossPay * periodsPerYear;

  // Federal tax (per period)
  const annualFederalTax = calculateFederalTax(annualizedIncome);
  const federalTax = annualFederalTax / periodsPerYear;

  // Provincial tax (simplified — Alberta rate)
  const provincialRates: Record<string, number> = {
    AB: 0.1,
    BC: 0.0506,
    ON: 0.0505,
    QC: 0.14,
    SK: 0.105,
    MB: 0.108,
    NB: 0.094,
    NS: 0.0879,
    PE: 0.098,
    NL: 0.087,
  };
  const provRate = provincialRates[province] || 0.1;
  const provincialTax = (annualizedIncome * provRate) / periodsPerYear;

  // CPP
  const cppPensionable = Math.min(annualizedIncome, CPP.maxPensionableEarnings) - CPP.basicExemption;
  const cppAnnual = Math.max(0, cppPensionable * CPP.rate);
  const cpp = cppAnnual / periodsPerYear;

  // EI
  const eiInsurable = Math.min(annualizedIncome, EI.maxInsurableEarnings);
  const eiAnnual = eiInsurable * EI.rate;
  const ei = eiAnnual / periodsPerYear;

  const totalDeductions = federalTax + provincialTax + cpp + ei;
  const netPay = grossPay - totalDeductions;

  return JSON.stringify({
    grossPay: Number(grossPay.toFixed(2)),
    deductions: {
      federalTax: Number(federalTax.toFixed(2)),
      provincialTax: Number(provincialTax.toFixed(2)),
      cpp: Number(cpp.toFixed(2)),
      ei: Number(ei.toFixed(2)),
      total: Number(totalDeductions.toFixed(2)),
    },
    netPay: Number(netPay.toFixed(2)),
    province,
    payFrequency,
    annualizedIncome: Number(annualizedIncome.toFixed(2)),
  });
}
