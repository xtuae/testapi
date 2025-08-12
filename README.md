# SkillPay Payment Integration React Application

This is a React application with Express backend that integrates with SkillPay payment gateway for processing UPI payments.

## Features

- React frontend with payment form
- Express backend with SkillPay API integration
- Environment-based configuration for local and production deployment
- AES-256 encryption for secure communication with SkillPay
- Beautiful UI with error handling

## Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── config.js      # Environment configuration
│   │   └── App.js         # Main application component
│   └── .env.example       # Example environment variables
├── server/                # Express backend server
│   ├── server.js          # Main server file
│   ├── .env               # Environment variables (not in git)
│   └── .env.example       # Example environment variables
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- SkillPay merchant account with AuthID and AuthKey

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/xtuae/testapi.git
cd testapi
```

### 2. Setup Backend

```bash
cd server
npm install

# Copy environment variables
cp .env.example .env

# Edit .env file with your SkillPay credentials
# Update SKILLPAY_AUTH_ID and SKILLPAY_AUTH_KEY
```

### 3. Setup Frontend

```bash
cd ../client
npm install
```

### 4. Running Locally

Start the backend server:
```bash
cd server
npm start
# Server runs on http://localhost:3001
```

Start the frontend application:
```bash
cd client
npm start
# Application runs on http://localhost:3000
```

## Environment Configuration

### Backend (.env)

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# SkillPay Configuration
SKILLPAY_AUTH_ID=your_auth_id
SKILLPAY_AUTH_KEY=your_auth_key

# Frontend URL (for callback)
FRONTEND_URL=http://localhost:3000

# API Base URL
API_BASE_URL=http://localhost:3001
```

### Frontend

For production deployment, create a `.env.local` file in the client directory:

```env
REACT_APP_API_BASE_URL=https://your-production-api.com
```

## Production Deployment

### Backend Deployment

1. Set environment variables on your production server
2. Update `FRONTEND_URL` to your production frontend URL
3. Update `API_BASE_URL` to your production API URL
4. Ensure HTTPS is enabled for secure communication

### Frontend Deployment

1. Create `.env.production` with your production API URL
2. Build the React application:
   ```bash
   npm run build
   ```
3. Deploy the build folder to your hosting service

## API Endpoints

### POST /api/paymentinit
Initiates a payment transaction with SkillPay.

Request body:
```json
{
  "amount": "100.00",
  "email": "customer@example.com",
  "contact": "9876543210"
}
```

### POST /api/statusenquiry
Checks the status of a payment transaction.

Request body:
```json
{
  "CustRefNum": "ORD1234567890"
}
```

## Important Notes

1. **Callback URL Registration**: Make sure your callback URL is registered with SkillPay. The error "Invalid Referrer.Return URL is not registered" indicates that the callback URL needs to be whitelisted in your SkillPay merchant dashboard.

2. **Security**: 
   - Never commit `.env` files to version control
   - Keep your AuthKey secure
   - Use HTTPS in production

3. **Testing**: Use test credentials provided by SkillPay for development and testing.

## Troubleshooting

### "Invalid Referrer" Error
This error occurs when the callback URL is not registered with SkillPay. Contact SkillPay support to register your callback URLs:
- Local: `http://localhost:3000/callback`
- Production: `https://yourdomain.com/callback`

### CORS Issues
The backend is configured to accept all origins in development. For production, update the CORS configuration in `server.js` to only allow your frontend domain.

## License

This project is licensed under the MIT License.
