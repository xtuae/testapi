import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import PaymentForm from './components/PaymentForm';
import Callback from './components/Callback';
import TransactionStatus from './components/TransactionStatus';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>SkillPay Payment Integration</h1>
          <nav style={{ marginTop: '10px' }}>
            <Link to="/" style={{ color: 'white', marginRight: '20px' }}>Make Payment</Link>
            <Link to="/status" style={{ color: 'white' }}>Check Status</Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<PaymentForm />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="/status" element={<TransactionStatus />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
