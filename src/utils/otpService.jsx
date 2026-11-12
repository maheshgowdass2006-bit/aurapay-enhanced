/** Local-only OTP demonstration helper. This module never sends SMS or stores secrets. */
const DEMO_CODE = '849201';
export function getSavedApiKey() {
    return '';
}
export function saveApiKey(_key) {
    // Intentionally disabled in this prototype.
}
export function getSavedMobile() {
    return '';
}
export function saveMobile(_mobile) {
    // No phone number is collected or stored by the prototype.
}
export function generateOTP() {
    return DEMO_CODE;
}
export async function sendOTP(_mobile, _otp) {
    return { success: true, isSimulated: true };
}
