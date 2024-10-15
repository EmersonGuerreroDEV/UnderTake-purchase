


export interface Checkout {
    // openpay?: OpenpayResponse
    // binance?: BinancePaymentResponseInterface,
    urlRedirect: string
}


export interface OpenpayResponse {
    id: string;
    amount: number;
    description: string;
    order_id: string;
    currency: string;
    iva: string;
    status: string;
    checkout_link: string;
    creation_date: string;
    expiration_date: string | null;
    customer: Customer;
}

export interface Customer {
    name: string;
    email: string;
    last_name: string;
    phone_number: string;
    external_id: string | null;
}
export interface BinancePaymentResponseInterface {
    code: string;

    prepayId: string;
    terminalType: string;
    expireTime: number; // Consider using a Date type if you need to work with it as a date
    qrcodeLink: string;
    qrContent: string;
    checkoutUrl: string;
    deeplink: string;
    universalUrl: string;

    errorMessage: string;
}
