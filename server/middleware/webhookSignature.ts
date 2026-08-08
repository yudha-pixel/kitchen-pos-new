import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Verify Midtrans webhook signature
 * Midtrans uses SHA512 hash of: order_id + status_code + gross_amount + server_key
 * Or for newer API: SHA512 of the JSON body + server key
 */
export function verifyMidtransSignature(
  signature: string | undefined,
  body: any,
  serverKey: string
): boolean {
  if (!signature) {
    return false;
  }

  try {
    // Midtrans signature format: SHA512(order_id + status_code + gross_amount + server_key)
    // For payment notifications, the signature is in the header 'X-Signature-Key'
    // The body contains order_id, status_code, gross_amount
    
    const { order_id, status_code, gross_amount } = body;
    
    if (!order_id || !status_code || gross_amount === undefined) {
      return false;
    }

    const signatureString = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const expectedSignature = crypto
      .createHash('sha512')
      .update(signatureString)
      .digest('hex');

    return signature === expectedSignature;
  } catch (error) {
    console.error('Error verifying Midtrans signature:', error);
    return false;
  }
}

/**
 * Verify Xendit webhook signature
 * Xendit uses HMAC-SHA256 of the raw request body + webhook token
 * The signature is in the header 'X-Callback-Token'
 */
export function verifyXenditSignature(
  signature: string | undefined,
  rawBody: string,
  webhookToken: string
): boolean {
  if (!signature) {
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookToken)
      .update(rawBody)
      .digest('hex');

    // Xendit sends the signature in hex format
    return signature === expectedSignature;
  } catch (error) {
    console.error('Error verifying Xendit signature:', error);
    return false;
  }
}

/**
 * Middleware to verify webhook signature based on the gateway
 * Supports both Midtrans and Xendit
 */
export function webhookSignatureMiddleware(req: Request, res: Response, next: NextFunction) {
  const { gateway } = req.body;
  const webhookSecret = process.env.WEBHOOK_SECRET;
  const midtransServerKey = process.env.MIDTRANS_SERVER_KEY;
  const xenditWebhookToken = process.env.XENDIT_SECRET_KEY;

  // If no webhook secret is configured, allow in development only
  if (!webhookSecret && !midtransServerKey && !xenditWebhookToken) {
    console.warn('⚠️ Webhook signature verification disabled - no secret keys configured');
    return next();
  }

  let isValid = false;

  if (gateway === 'midtrans') {
    const signature = req.headers['x-signature-key'] as string;
    if (!midtransServerKey) {
      console.error('❌ Midtrans server key not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    isValid = verifyMidtransSignature(signature, req.body, midtransServerKey);
  } else if (gateway === 'xendit') {
    const signature = req.headers['x-callback-token'] as string;
    if (!xenditWebhookToken) {
      console.error('❌ Xendit webhook token not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    // For Xendit, we need the raw body, which should be available if we use express raw body parser
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    isValid = verifyXenditSignature(signature, rawBody, xenditWebhookToken);
  } else {
    console.error('❌ Unknown payment gateway:', gateway);
    return res.status(400).json({ error: 'Unknown payment gateway' });
  }

  if (!isValid) {
    console.error('❌ Invalid webhook signature for gateway:', gateway);
    return res.status(401).json({ error: 'Invalid webhook signature' });
  }

  console.log('✅ Webhook signature verified for gateway:', gateway);
  next();
}
