# Razorpay Build Error Fix

## Issue
Build was failing with error: `key_id` or `oauthToken` is mandatory

## Root Cause
Razorpay was being initialized at module level (outside functions) which happens during build time when environment variables aren't available.

## Files Fixed

### 1. `/api/sessions/create-payment/route.ts`
**Before:**
```typescript
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(req: NextRequest) {
  // ... function code
}
```

**After:**
```typescript
export async function POST(req: NextRequest) {
  // Initialize Razorpay inside the function
  const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpayKeyId || !razorpayKeySecret) {
    return NextResponse.json(
      { error: "Payment gateway not configured" },
      { status: 500 }
    );
  }

  const razorpay = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  });
  
  // ... rest of function code
}
```

### 2. `/api/razorpay/create-order/route.ts`
**Fixed:** Changed `RAZORPAY_KEY_ID` to `NEXT_PUBLIC_RAZORPAY_KEY_ID` for consistency

## Environment Variables

Make sure your `.env` file has:
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## Why This Fix Works

1. **Module-level initialization** happens during build time
2. Environment variables may not be available during build
3. **Function-level initialization** happens at runtime
4. Environment variables are available at runtime
5. Proper error handling when credentials are missing

## Testing

1. Clear Next.js cache:
   ```bash
   rm -rf .next
   ```

2. Rebuild:
   ```bash
   npm run build
   ```

3. Build should complete successfully

## Production Deployment

For production, ensure:
- Environment variables are set in your hosting platform
- Use Razorpay LIVE keys (not test keys)
- Test payment flow thoroughly before going live

## Additional Notes

- `NEXT_PUBLIC_*` variables are exposed to the browser
- `RAZORPAY_KEY_SECRET` should NEVER be exposed to the browser
- Only use `NEXT_PUBLIC_RAZORPAY_KEY_ID` in client-side code
- Always use `RAZORPAY_KEY_SECRET` only in server-side API routes
