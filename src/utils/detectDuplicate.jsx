/**
 * Duplicate / Split-Payment Detection Utility
 *
 * Detects potentially suspicious repeated payments:
 * — Same UPI ID (or consumer reference)
 * — Same amount
 * — 3 or more occurrences within a rolling 1-hour window
 */
/**
 * Check whether a *new* payment (upiOrRef + amount) would be the 3rd (or more)
 * identical payment within `windowMs` milliseconds.
 *
 * @param transactions   Existing transaction history
 * @param upiOrRef       The destination UPI ID or consumer reference
 * @param amount         Payment amount in INR
 * @param windowMs       Rolling detection window (default 1 hour)
 */
export function detectDuplicatePayment(transactions, upiOrRef, amount, windowMs = 60 * 60 * 1000) {
    const now = Date.now();
    const matches = transactions.filter((tx) => {
        const ref = tx.accountReference?.toLowerCase() ?? '';
        const targetRef = upiOrRef?.toLowerCase() ?? '';
        const sameRef = ref.includes(targetRef) || targetRef.includes(ref) || ref === targetRef;
        const sameAmount = Math.abs(tx.amount - amount) < 0.01;
        const withinWindow = tx.timestamp !== undefined ? now - tx.timestamp < windowMs : false;
        return sameRef && sameAmount && withinWindow;
    });
    if (matches.length === 0) {
        return { isDuplicate: false, count: 0, windowHours: windowMs / 3600000 };
    }
    const dates = matches
        .map((tx) => tx.timestamp ?? 0)
        .sort((a, b) => a - b);
    return {
        isDuplicate: matches.length >= 2, // 2 prior + 1 current attempt = 3rd payment
        count: matches.length,
        windowHours: windowMs / 3600000,
        firstOccurrence: dates[0]
            ? new Date(dates[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : undefined,
        lastOccurrence: dates[dates.length - 1]
            ? new Date(dates[dates.length - 1]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : undefined,
    };
}
