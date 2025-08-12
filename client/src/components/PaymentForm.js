import React, { useState } from 'react';
import axios from 'axios';
import config from '../config';

const PaymentForm = () => {
    const [amount, setAmount] = useState('');
    const [email, setEmail] = useState('');
    const [contact, setContact] = useState('');
    const [error, setError] = useState(null);
    const [paymentResponse, setPaymentResponse] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setPaymentResponse(null);

        try {
            const response = await axios.post(`${config.API_BASE_URL}/api/paymentinit`, {
                amount,
                email,
                contact,
            });
            setPaymentResponse(response.data);
            if (response.data.qrString) {
                window.location.href = response.data.qrString;
            }
        } catch (err) {
            setError(err.response ? err.response.data.details : 'An error occurred');
        }
    };

    return (
        <div>
            <h2>Make a Payment</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Amount:</label>
                    <input
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Contact Number:</label>
                    <input
                        type="text"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Pay Now</button>
            </form>
            {error && <p className="error">{error}</p>}
            {paymentResponse && (
                <div className="response">
                    <h3>Payment Initiated</h3>
                    <div style={{ textAlign: 'left' }}>
                        <p><strong>Reference Number:</strong> {paymentResponse.CustRefNum}</p>
                        <p><strong>Amount:</strong> ₹{paymentResponse.PayAmount}</p>
                        <p><strong>Status:</strong> {paymentResponse.payStatus === 'PPPP' ? 'Pending' : paymentResponse.payStatus}</p>
                        <p><strong>Message:</strong> {paymentResponse.resp_message}</p>
                        {paymentResponse.qrString && (
                            <p style={{ marginTop: '20px' }}>
                                <strong>Redirecting to payment page...</strong>
                            </p>
                        )}
                        <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
                            Save this reference number to check your payment status later: <strong>{paymentResponse.CustRefNum}</strong>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentForm;
