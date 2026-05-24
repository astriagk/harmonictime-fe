# Bank Account Verification — Frontend Guide

## Overview

When a seller adds a bank account it starts as **unverified**. They must verify it via a Razorpay penny-drop before they can request a withdrawal. This protects the platform from sending payouts to wrong accounts. Once verified, any payout errors become the seller's responsibility.

---

## Flow

```
Add Bank Account → Unverified (IsVerified: false)
       ↓
Seller clicks "Verify Account"
       ↓
POST /bank-accounts/:accountID/verify
       ↓
Razorpay sends ₹1 to the account (penny-drop)
       ↓
Success → IsVerified: true, VerifiedName returned
Failure → VerificationStatus: "failed", error message shown
       ↓
Seller can now request withdrawals (only from verified accounts)
```

---

## API Reference

### 1. Add a Bank Account

**POST** `/seller/bank-accounts`

Headers: `Authorization: Bearer <token>`

Request body:
```json
{
  "AccountHolderName": "Rahul Sharma",
  "AccountNumber": "123456789012",
  "IFSC": "HDFC0001234",
  "BankName": "HDFC Bank",
  "IsDefault": true
}
```

Response:
```json
{
  "success": true,
  "message": "Bank account added successfully",
  "data": {
    "insertedId": "664abc..."
  }
}
```

> The account is saved with `IsVerified: false` and `VerificationStatus: "unverified"`.

---

### 2. Get All Bank Accounts

**GET** `/seller/bank-accounts`

Headers: `Authorization: Bearer <token>`

Response includes verification fields:
```json
{
  "success": true,
  "data": [
    {
      "_id": "664abc...",
      "AccountHolderName": "Rahul Sharma",
      "AccountNumber": "123456789012",
      "IFSC": "HDFC0001234",
      "BankName": "HDFC Bank",
      "IsDefault": true,
      "IsVerified": false,
      "VerificationStatus": "unverified",
      "VerifiedAt": null,
      "VerifiedName": null,
      "CreatedAt": "2024-05-20T10:00:00Z"
    }
  ]
}
```

`VerificationStatus` values: `"unverified"` | `"verified"` | `"failed"`

---

### 3. Verify a Bank Account

**POST** `/seller/bank-accounts/:accountID/verify`

Headers: `Authorization: Bearer <token>`

No request body needed.

**Success response (200):**
```json
{
  "success": true,
  "message": "Bank account verified successfully",
  "data": {
    "IsVerified": true,
    "VerificationStatus": "verified",
    "VerifiedName": "RAHUL SHARMA"
  }
}
```

> `VerifiedName` is the name registered with the bank (returned by Razorpay). Show this to the seller so they can confirm it matches.

**Already verified response (200):**
```json
{
  "success": true,
  "message": "Bank account is already verified",
  "data": {
    "IsVerified": true,
    "VerificationStatus": "verified",
    "VerifiedName": "RAHUL SHARMA",
    "VerifiedAt": "2024-05-20T11:00:00Z"
  }
}
```

**Failure response (400):**
```json
{
  "success": false,
  "message": "Bank account verification failed. Please check your account number and IFSC code."
}
```

---

## UI Implementation Guide

### Bank Account List Card

Each bank account card should show a verification badge:

| VerificationStatus | Badge | Action button |
|--------------------|-------|---------------|
| `unverified` | 🔴 Unverified | "Verify Account" button |
| `verified` | 🟢 Verified | None (or "Verified on {date}") |
| `failed` | 🔴 Verification Failed | "Retry Verification" button |

### Verify Button Behaviour

1. User clicks **"Verify Account"**
2. Show a confirmation dialog:
   > "We will send ₹1 to your account ending in XXXX1234 to verify it. This amount will be refunded. Proceed?"
3. On confirm → call `POST /bank-accounts/:accountID/verify`
4. Show loading state while waiting (Razorpay penny-drop takes 3–10 seconds)
5. On success:
   - Show success toast: `"Account verified! Bank confirmed name: RAHUL SHARMA"`
   - If `VerifiedName` differs noticeably from the saved `AccountHolderName`, warn: `"The bank-registered name (RAHUL SHARMA) is different from what you entered. Please ensure this is correct."`
   - Update the card badge to 🟢 Verified
6. On failure:
   - Show error toast with the API error message
   - Update badge to 🔴 Verification Failed
   - Keep the "Retry Verification" button active

### Withdrawal Request — Block Unverified

When the seller tries to request a withdrawal and picks an unverified account:
- Disable the "Withdraw" button for unverified accounts in the account selector
- Show tooltip: `"Verify this account first to use it for withdrawals"`
- If the API returns 400 with the unverified message, show it as a banner error

---

## Important Notes for Frontend

1. **Re-verification after edit**: If the seller edits `AccountNumber` or `IFSC`, reset `VerificationStatus` to `unverified` on the UI side and prompt them to re-verify. (The backend does not auto-reset on edit — handle this in the UI or ask backend to add that logic.)

2. **Name mismatch warning**: Always display `VerifiedName` after a successful verification so the seller can catch errors (e.g., joint accounts, business accounts where the name differs).

3. **Cost per verification**: Each penny-drop costs a small fee (charged by Razorpay). Do not allow unlimited retries — consider disabling the retry button for 60 seconds after a failure.

4. **Liability notice**: Show a one-time notice before the first verification:
   > "Once your bank account is verified, HarmonicTime will send payouts to it as-is. Please make sure the details are correct. Any payout issues after verification are your responsibility."

---

## Environment Variable Required (Backend)

Make sure the backend `.env` has:
```
RAZORPAY_ACCOUNT_NUMBER=your_razorpayX_account_number
```
This is your Razorpay X current account number (not the key ID). Get it from your Razorpay X dashboard → Account & Settings → Bank Account. Fund Account Validation must be activated on your Razorpay X account.
