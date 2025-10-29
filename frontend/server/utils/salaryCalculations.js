// utils/salaryCalculations.js

/**
 * Kenya Tax Calculation Utilities
 * Based on 2024/2025 Kenya Revenue Authority (KRA) Tax Rates
 */

/**
 * Calculate PAYE (Pay As You Earn) Tax - Kenya KRA Rates
 * Tax Bands for 2024/2025:
 * - Up to 24,000: 10%
 * - 24,001 to 32,333: 25%
 * - 32,334 to 500,000: 30%
 * - 500,001 to 800,000: 32.5%
 * - Above 800,000: 35%
 * 
 * Personal Relief: KES 2,400 per month (28,800 per year)
 */
export const calculatePAYE = (monthlyGrossSalary) => {
    const annualGross = monthlyGrossSalary * 12;
    let tax = 0;

    if (annualGross <= 288000) { // Up to 24,000 per month
        tax = annualGross * 0.10;
    } else if (annualGross <= 388000) { // 24,001 to 32,333 per month
        tax = (288000 * 0.10) + ((annualGross - 288000) * 0.25);
    } else if (annualGross <= 6000000) { // 32,334 to 500,000 per month
        tax = (288000 * 0.10) + (100000 * 0.25) + ((annualGross - 388000) * 0.30);
    } else if (annualGross <= 9600000) { // 500,001 to 800,000 per month
        tax = (288000 * 0.10) + (100000 * 0.25) + (5612000 * 0.30) + ((annualGross - 6000000) * 0.325);
    } else { // Above 800,000 per month
        tax = (288000 * 0.10) + (100000 * 0.25) + (5612000 * 0.30) + (3600000 * 0.325) + ((annualGross - 9600000) * 0.35);
    }

    // Apply personal relief (2,400 per month = 28,800 per year)
    const personalRelief = 28800;
    tax = Math.max(0, tax - personalRelief);

    // Return monthly tax
    return Math.round(tax / 12);
};

/**
 * Calculate NHIF (National Hospital Insurance Fund)
 * Rates based on gross salary brackets (2024/2025)
 */
export const calculateNHIF = (monthlyGrossSalary) => {
    if (monthlyGrossSalary <= 5999) return 150;
    if (monthlyGrossSalary <= 7999) return 300;
    if (monthlyGrossSalary <= 11999) return 400;
    if (monthlyGrossSalary <= 14999) return 500;
    if (monthlyGrossSalary <= 19999) return 600;
    if (monthlyGrossSalary <= 24999) return 750;
    if (monthlyGrossSalary <= 29999) return 850;
    if (monthlyGrossSalary <= 34999) return 900;
    if (monthlyGrossSalary <= 39999) return 950;
    if (monthlyGrossSalary <= 44999) return 1000;
    if (monthlyGrossSalary <= 49999) return 1100;
    if (monthlyGrossSalary <= 59999) return 1200;
    if (monthlyGrossSalary <= 69999) return 1300;
    if (monthlyGrossSalary <= 79999) return 1400;
    if (monthlyGrossSalary <= 89999) return 1500;
    if (monthlyGrossSalary <= 99999) return 1600;
    return 1700; // Above 100,000
};

/**
 * Calculate NSSF (National Social Security Fund)
 * New NSSF rates (2024):
 * - Tier I: 6% of pensionable pay (max 7,000) - Employee and Employer each
 * - Tier II: 6% of pensionable pay (max 36,000) - Employee and Employer each
 * Total employee contribution capped at 2,160 per month (6% of 36,000)
 */
export const calculateNSSF = (monthlyGrossSalary) => {
    const tier1Limit = 7000;
    const tier2Limit = 36000;
    const rate = 0.06;

    let tier1 = 0;
    let tier2 = 0;

    if (monthlyGrossSalary <= tier1Limit) {
        tier1 = monthlyGrossSalary * rate;
    } else {
        tier1 = tier1Limit * rate; // 420
        if (monthlyGrossSalary > tier1Limit) {
            const tier2Base = Math.min(monthlyGrossSalary - tier1Limit, tier2Limit - tier1Limit);
            tier2 = tier2Base * rate;
        }
    }

    return Math.round(tier1 + tier2);
};

/**
 * Calculate Affordable Housing Levy
 * Rate: 1.5% of gross salary (both employee and employer)
 */
export const calculateHousingLevy = (monthlyGrossSalary) => {
    return Math.round(monthlyGrossSalary * 0.015);
};

/**
 * Calculate all salary deductions and net salary
 * @param {Object} salaryData - Contains basicSalary and allowances
 * @returns {Object} - Complete salary breakdown
 */
export const calculateCompleteSalary = (salaryData) => {
    const { basicSalary = 0, allowances = {} } = salaryData;

    // Calculate gross salary
    const totalAllowances = 
        (allowances.housing || 0) + 
        (allowances.transport || 0) + 
        (allowances.medical || 0) + 
        (allowances.other || 0);

    const grossSalary = basicSalary + totalAllowances;

    // Calculate deductions
    const nhif = calculateNHIF(grossSalary);
    const nssf = calculateNSSF(grossSalary);
    const housingLevy = calculateHousingLevy(grossSalary);
    
    // PAYE is calculated on (Gross - NSSF - Housing Levy)
    const taxableIncome = grossSalary - nssf - housingLevy;
    const paye = calculatePAYE(taxableIncome);

    const totalDeductions = nhif + nssf + housingLevy + paye;
    const netSalary = grossSalary - totalDeductions;

    return {
        basicSalary,
        allowances: {
            housing: allowances.housing || 0,
            transport: allowances.transport || 0,
            medical: allowances.medical || 0,
            other: allowances.other || 0
        },
        totalAllowances,
        grossSalary,
        deductions: {
            nhif,
            nssf,
            housingLevy,
            paye
        },
        totalDeductions,
        netSalary: Math.round(netSalary)
    };
};

/**
 * Get salary breakdown summary for display
 */
export const getSalarySummary = (salaryData) => {
    const breakdown = calculateCompleteSalary(salaryData);
    
    return {
        earnings: [
            { label: 'Basic Salary', amount: breakdown.basicSalary },
            { label: 'Housing Allowance', amount: breakdown.allowances.housing },
            { label: 'Transport Allowance', amount: breakdown.allowances.transport },
            { label: 'Medical Allowance', amount: breakdown.allowances.medical },
            { label: 'Other Allowances', amount: breakdown.allowances.other },
        ],
        grossSalary: breakdown.grossSalary,
        deductions: [
            { label: 'NHIF', amount: breakdown.deductions.nhif, description: 'National Hospital Insurance Fund' },
            { label: 'NSSF', amount: breakdown.deductions.nssf, description: 'National Social Security Fund' },
            { label: 'Housing Levy', amount: breakdown.deductions.housingLevy, description: 'Affordable Housing Levy (1.5%)' },
            { label: 'PAYE', amount: breakdown.deductions.paye, description: 'Pay As You Earn Tax' },
        ],
        totalDeductions: breakdown.totalDeductions,
        netSalary: breakdown.netSalary
    };
};

/**
 * Validate Kenya National ID
 * Format: 8 digits
 */
export const validateNationalId = (nationalId) => {
    const idPattern = /^\d{8}$/;
    return idPattern.test(nationalId);
};

/**
 * Validate Kenya Phone Number
 * Formats: 0712345678, 0712 345678, +254712345678, 254712345678
 */
export const validatePhoneNumber = (phone) => {
    const phonePattern = /^(\+?254|0)?[17]\d{8}$/;
    return phonePattern.test(phone.replace(/\s/g, ''));
};

/**
 * Format phone number to Kenya standard
 */
export const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.startsWith('+254')) {
        return cleaned;
    } else if (cleaned.startsWith('254')) {
        return '+' + cleaned;
    } else if (cleaned.startsWith('0')) {
        return '+254' + cleaned.substring(1);
    }
    return '+254' + cleaned;
};

export default {
    calculatePAYE,
    calculateNHIF,
    calculateNSSF,
    calculateHousingLevy,
    calculateCompleteSalary,
    getSalarySummary,
    validateNationalId,
    validatePhoneNumber,
    formatPhoneNumber
};