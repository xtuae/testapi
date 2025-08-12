import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import https from 'https';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const SKILLPAY_AUTH_ID = process.env.SKILLPAY_AUTH_ID;
const SKILLPAY_AUTH_KEY = process.env.SKILLPAY_AUTH_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

// Function to encrypt data using AES-256-CBC
const encrypt = (data, key) => {
  const iv = key.substring(0, 16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
};

// Function to decrypt data using AES-256-CBC
const decrypt = (encryptedData, key) => {
  const iv = key.substring(0, 16);
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
};

app.post('/api/paymentinit', (req, res) => {
  const paymentData = req.body;

  // Add required fields from the documentation
  const requestData = {
    AuthID: SKILLPAY_AUTH_ID,
    AuthKey: SKILLPAY_AUTH_KEY,
    CustRefNum: `ORD${Date.now()}`,
    txn_Amount: paymentData.amount,
    PaymentDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
    ContactNo: paymentData.contact,
    EmailId: paymentData.email,
    IntegrationType: 'seamless',
    CallbackURL: `${FRONTEND_URL}/callback`, // Your frontend callback URL
    adf1: 'NA',
    adf2: 'NA',
    adf3: 'NA',
    MOP: 'UPI',
    MOPType: 'UPI',
    MOPDetails: 'I',
  };

  const encData = encrypt(requestData, SKILLPAY_AUTH_KEY);

  const options = {
    hostname: 'dashboard.skill-pay.in',
    path: `/pay/paymentinit?encData=${encodeURIComponent(encData)}&AuthID=${SKILLPAY_AUTH_ID}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const skillPayReq = https.request(options, (skillPayRes) => {
    let data = '';
    skillPayRes.on('data', (chunk) => {
      data += chunk;
    });
    skillPayRes.on('end', () => {
      console.log('SkillPay Response:', data);
      try {
        // Check if the response is JSON
        if (data.trim().startsWith('{')) {
          const response = JSON.parse(data);
          if (response.respData) {
            const decryptedData = decrypt(response.respData, SKILLPAY_AUTH_KEY);
            res.json(decryptedData);
          } else {
            res.status(500).json({ error: 'Invalid response from SkillPay', details: JSON.stringify(response) });
          }
        } else {
            res.status(500).json({ error: 'Received non-JSON response from SkillPay', details: data });
        }
      } catch (error) {
        res.status(500).json({ error: 'Failed to process SkillPay response', details: error.message });
      }
    });
  });

  skillPayReq.on('error', (error) => {
    res.status(500).json({ error: 'Failed to connect to SkillPay', details: error.message });
  });

  skillPayReq.end();
});

app.post('/api/statusenquiry', (req, res) => {
    const { CustRefNum } = req.body;

    const options = {
        hostname: 'dashboard.skill-pay.in',
        path: `/pay/statusenquiry?AuthID=${SKILLPAY_AUTH_ID}&CustRefNum=${CustRefNum}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const skillPayReq = https.request(options, (skillPayRes) => {
        let data = '';
        skillPayRes.on('data', (chunk) => {
            data += chunk;
        });
        skillPayRes.on('end', () => {
            try {
                const response = JSON.parse(data);
                res.json(response);
            } catch (error) {
                res.status(500).json({ error: 'Failed to process SkillPay response', details: error.message });
            }
        });
    });

    skillPayReq.on('error', (error) => {
        res.status(500).json({ error: 'Failed to connect to SkillPay', details: error.message });
    });

    skillPayReq.end();
});

// Handle callback from SkillPay with encrypted data
app.post('/api/callback', (req, res) => {
    console.log('Callback received:', req.body);
    
    try {
        // Check if we have encrypted response data
        if (req.body.respData) {
            const decryptedData = decrypt(req.body.respData, SKILLPAY_AUTH_KEY);
            console.log('Decrypted callback data:', decryptedData);
            res.json({ success: true, data: decryptedData });
        } else if (req.body.txnErrorMsg) {
            // Handle error response
            res.json({ success: false, error: req.body.txnErrorMsg });
        } else {
            res.json({ success: false, error: 'No data received' });
        }
    } catch (error) {
        console.error('Error processing callback:', error);
        res.status(500).json({ success: false, error: 'Failed to process callback', details: error.message });
    }
});


try {
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
} catch (error) {
    console.error("Error starting server:", error);
}
