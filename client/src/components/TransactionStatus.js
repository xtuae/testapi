import React, { useState } from 'react';
import axios from 'axios';
import config from '../config';

const TransactionStatus = () => {
    const [custRefNum, setCustRefNum] = useState('');
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const checkStatus = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setStatus(null);

        try {
            const response = await axios.post(`${config.API_BASE_URL}/api/statusenquiry`, {
                CustRefNum: custRefNum,
            });
            setStatus(response.data);
        } catch (err) {
            setError(err.response ? err.response.data.error : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

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

    return (
        <div>
            <h2>Check Transaction Status</h2>
            <form onSubmit={checkStatus}>
                <div>
                    <label>Transaction Reference Number:</label>
                    <input
                        type="text"
                        value={custRefNum}
                        onChange={(e) => setCustRefNum(e.target.value)}
                        placeholder="e.g., ORD1234567890"
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Checking...' : 'Check Status'}
                </button>
            </form>

            {error && <p className="error">{error}</p>}

            {status && (
                <div className="response">
                    <h3>Transaction Details</h3>
                    <div style={{ textAlign: 'left' }}>
                        <p><strong>Reference Number:</strong> {status.CustRefNum}</p>
                        <p><strong>Amount:</strong> ₹{status.PayAmount}</p>
                        <p>
                            <strong>Status:</strong>{' '}
                            <span style={{ color: getStatusColor(status.payStatus) }}>
                                {getStatusText(status.payStatus)}
                            </span>
                        </p>
                        <p><strong>Message:</strong> {status.resp_message}</p>
                        <p><strong>Email:</strong> {status.EmailId}</p>
                        <p><strong>Contact:</strong> {status.ContactNo}</p>
                        <p><strong>Payment Date:</strong> {status.PaymentDate}</p>
                        {status.serviceRRN && status.serviceRRN !== 'NA' && (
                            <p><strong>Bank Reference:</strong> {status.serviceRRN}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionStatus;
