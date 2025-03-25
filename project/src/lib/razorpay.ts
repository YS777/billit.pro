import { loadScript } from '../utils/loadScript';

const RAZORPAY_KEY = 'YOUR_RAZORPAY_KEY_ID'; // Replace with your actual key

interface PaymentOptions {
  amount: number;
  currency: string;
  name: string;
  description: string;
  orderId: string;
  prefillEmail?: string;
  prefillName?: string;
  theme?: {
    color: string;
  };
}

export async function initializeRazorpay(): Promise<boolean> {
  const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
  return res;
}

export function createRazorpayOrder(options: PaymentOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const rzp = new (window as any).Razorpay({
      key: RAZORPAY_KEY,
      amount: options.amount * 100, // Razorpay expects amount in paise
      currency: 'INR', // Always use INR for Razorpay
      name: 'Billit.pro',
      description: options.description,
      order_id: options.orderId,
      handler: function (response: any) {
        resolve(response);
      },
      prefill: {
        email: options.prefillEmail,
        name: options.prefillName,
      },
      theme: {
        color: options.theme?.color || '#4F46E5',
      },
    });

    rzp.on('payment.failed', function (response: any) {
      reject(response.error);
    });

    rzp.open();
  });
}