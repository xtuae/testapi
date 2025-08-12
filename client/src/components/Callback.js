import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import config from '../config';

const Callback = () => {
    const [paymentData, setPaymentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const processCallback = async () => {
            // Check if we have form data (POST request from SkillPay)
            const formData = new FormData();
            const searchParams = new URLSearchParams(location.search);
            
            // Try to get data from URL params first
            for (const [key, value] of searchParams) {
                formData.append(key, value);
            }

            // If we have respData or txnErrorMsg, send it to backend for processing
            const respData = searchParams.get('respData');
            const txnErrorMsg = searchParams.get('txnErrorMsg');
            const custRefNum = searchParams.get('CustRefNum');

            if (respData || txnErrorMsg) {
                try {
                    const response = await axios.post(`${config.API_BASE_URL}/api/callback`, {
                        respData,
                        txnErrorMsg,
                    });

                    if (response.data.success) {
                        setPaymentData(response.data.data);
                    } else {
                        setError(response.data.error);
                    }
                } catch (err) {
                    setError(err.response ? err.response.data.error : 'Failed to process payment response');
                }
            } else if (custRefNum) {
                // Fallback to status enquiry if we only have CustRefNum
                try {
                    const response = await axios.post(`${config.API_BASE_URL}/api/statusenquiry`, {
                        CustRefNum: custRefNum,
                    });
                    setPaymentData(response.data);
                } catch (err) {
                    setError(err.response ? err.response.data.error : 'Failed to get transaction status');
                }
            } else {
                setError('No payment data received');
            }

            setLoading(false);
        };

        processCallback();
    }, [location]);

    const getStatusColor = (payStatus) => {
        switch (payStatus) {
            case 'Ok':
                return 'green';
            case 'F':
                return 'red';
            case 'PPPP':
                return 'orange';
            default:
                return 'black';
        }
    };

    const getStatusText = (payStatus) => {
        switch (payStatus) {
            case 'Ok':
                return 'Success';
            case 'F':
                return 'Failed';
            case 'PPPP':
                return 'Pending';
            default:
                return payStatus;
        }
    };

    if (loading) {
        return (
            <div>
                <h2>Processing Payment...</h2>
                <p>Please wait while we process your payment.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <h2>Payment Error</h2>
                <div className="error">
                    {typeof error === 'string' ? error : JSON.stringify(error, null, 2)}
                </div>
            </div>
        );
    }

    if (!paymentData) {
        return (
            <div>
                <h2>No Payment Data</h2>
                <p>No payment information was received.</p>
            </div>
        );
    }

    return (
        <div>
            <h2>Payment {getStatusText(paymentData.payStatus)}</h2>
            <div className="response">
                <div style={{ textAlign: 'left' }}>
                    <p>
                        <strong>Status:</strong>{' '}
                        <span style={{ color: getStatusColor(paymentData.payStatus), fontSize: '1.2em' }}>
                            {getStatusText(paymentData.payStatus)}
                        </span>
                    </p>
                    <p><strong>Message:</strong> {paymentData.resp_message}</p>
                    <p><strong>Reference Number:</strong> {paymentData.CustRefNum}</p>
                    <p><strong>Amount:</strong> ₹{paymentData.PayAmount}</p>
                    <p><strong>Email:</strong> {paymentData.EmailId || paymentData.userEmailID}</p>
                    <p><strong>Contact:</strong> {paymentData.ContactNo}</p>
                    <p><strong>Payment Date:</strong> {paymentData.PaymentDate || paymentData.Paymentdate}</p>
                    {paymentData.AggRefNo && (
                        <p><strong>Transaction ID:</strong> {paymentData.AggRefNo}</p>
                    )}
                    {paymentData.serviceRRN && paymentData.serviceRRN !== 'NA' && (
                        <p><strong>Bank Reference:</strong> {paymentData.serviceRRN}</p>
                    )}
                    {paymentData.resp_code && (
                        <p><strong>Response Code:</strong> {paymentData.resp_code}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Callback;
