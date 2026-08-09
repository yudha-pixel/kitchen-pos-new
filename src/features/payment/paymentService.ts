import { PaymentTransaction } from '@/src/lib/db';
import { getToken } from '@/src/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface PaymentTransactionWithOrder extends PaymentTransaction {
  order?: {
    id: string;
    total_amount: number;
    status: string;
  };
}

// Create payment transaction. Note: the payment amount is intentionally NOT
// sent from the client - the server always derives it from the order's own
// `total_amount` column to prevent payment-amount tampering. See
// server/routes/payments.ts for the authoritative calculation.
export async function createPaymentTransaction(
  orderId: string,
  gateway: 'midtrans' | 'xendit',
  paymentMethod: 'qris' | 'va' | 'ewallet'
): Promise<PaymentTransactionWithOrder | null> {
  try {
    console.log('Creating payment transaction:', { orderId, gateway, paymentMethod });
    
    const token = getToken();
    const response = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({
        order_id: orderId,
        gateway,
        payment_method: paymentMethod,
      }),
    });

    console.log('Payment API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Payment creation failed:', response.status, errorData);
      throw new Error(errorData.error || 'Failed to create payment');
    }

    const result = await response.json();
    console.log('Payment created successfully:', result);
    return result;
  } catch (error) {
    console.error('Error creating payment:', error);
    return null;
  }
}

// Get payment by ID
export async function getPaymentById(paymentId: string): Promise<PaymentTransactionWithOrder | null> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE}/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching payment:', error);
    return null;
  }
}

// Update payment status
export async function updatePaymentStatus(
  paymentId: string,
  status: 'pending' | 'paid' | 'failed' | 'expired',
  gatewayTxId?: string,
  paidAt?: string
): Promise<PaymentTransactionWithOrder | null> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE}/payments/${paymentId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
        gateway_tx_id: gatewayTxId,
        paid_at: paidAt,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update payment status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating payment status:', error);
    return null;
  }
}

// Poll payment status
export async function pollPaymentStatus(
  paymentId: string,
  interval = 3000,
  maxAttempts = 20
): Promise<PaymentTransactionWithOrder | null> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const payment = await getPaymentById(paymentId);
    
    if (!payment) {
      return null;
    }

    if (payment.status === 'paid' || payment.status === 'failed' || payment.status === 'expired') {
      return payment;
    }

    attempts++;
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  return null;
}
