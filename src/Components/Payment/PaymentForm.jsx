import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { addPayment } from '../../Firebase/paymentServices.js';
import { toast } from "sonner";
import { useAuth } from '../../Context/AuthContext';
import { Separator } from '../ui/separator';
import PaymentProcessingAnimation from './PaymentProcessingAnimation';
import PaytmLogo from '../../assets/paytm.svg';
import PhonePeLogo from '../../assets/phonepe.svg';
import GPayLogo from '../../assets/gpay.svg';
import AmazonPayLogo from '../../assets/amazonpay.svg';
import VisaLogo from '../../assets/visa.svg';
import MastercardLogo from '../../assets/mastercard.svg';
import AmexLogo from '../../assets/amex.svg';
import RupayLogo from '../../assets/rupay.svg';

// Card type definitions with logos, patterns and colors
const cardTypes = [
  { id: 'visa', name: 'Visa', pattern: /^4/, logo: VisaLogo, color: '#1A1F71', textColor: 'white' },
  { id: 'mastercard', name: 'Mastercard', pattern: /^5[1-5]/, logo: MastercardLogo, color: '#EB001B', textColor: 'white' },
  { id: 'amex', name: 'American Express', pattern: /^3[47]/, logo: AmexLogo, color: '#2E77BC', textColor: 'white' },
  { id: 'rupay', name: 'RuPay', pattern: /^6/, logo: RupayLogo, color: '#8B2131', textColor: 'white' },
];

// Demo card details
const demoCards = {
  visa: {
    number: '4111 1111 1111 1111',
    name: 'Test User',
    expiry: '02/30',
    cvv: '273'
  },
  mastercard: {
    number: '5555 5555 5555 4444',
    name: 'Test User',
    expiry: '12/28',
    cvv: '879'
  },
  amex: {
    number: '3714 4963 5398 431',
    name: 'Test User',
    expiry: '07/35',
    cvv: '146'
  },
  rupay: {
    number: '6522 3614 6548 7894',
    name: 'Test User',
    expiry: '10/32',
    cvv: '847'
  }
};

// Available wallets
const wallets = [
  {
    id: 'paytm',
    name: 'Paytm',
    logo: <img src={PaytmLogo} alt="Paytm" className="h-8" />
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    logo: <img src={PhonePeLogo} alt="PhonePe" className="h-8" />
  },
  {
    id: 'gpay',
    name: 'Google Pay',
    logo: <img src={GPayLogo} alt="Google Pay" className="h-8" />
  },
  {
    id: 'amazonpay',
    name: 'Amazon Pay',
    logo: <img src={AmazonPayLogo} alt="Amazon Pay" className="h-8" />
  }
];

// Available banks for net banking
const banks = [
  { id: 'sbi', name: 'State Bank of India' },
  { id: 'hdfc', name: 'HDFC Bank' },
  { id: 'icici', name: 'ICICI Bank' },
  { id: 'axis', name: 'Axis Bank' },
  { id: 'kotak', name: 'Kotak Mahindra Bank' },
  { id: 'bob', name: 'Bank of Baroda' },
  { id: 'pnb', name: 'Punjab National Bank' },
  { id: 'idfc', name: 'IDFC First Bank' },
  { id: 'yesbank', name: 'Yes Bank' }
];

function PaymentForm({ amount, orderId, onPaymentSuccess, onCancel }) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [upiId, setUpiId] = useState('');
  const [netBankingBank, setNetBankingBank] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { currentUser } = useAuth();
  const [detectedCardType, setDetectedCardType] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Handle card number input and detect card type
  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    setCardDetails({ ...cardDetails, number: value });

    // Detect card type
    const cardNumber = value.replace(/\s/g, '');
    const foundCard = cardTypes.find(card => card.pattern.test(cardNumber));
    setDetectedCardType(foundCard ? foundCard.id : null);
  };

  // Auto-format expiry date (MM/YY)
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setCardDetails({ ...cardDetails, expiry: value });
  };

  // Fill demo card details
  const fillDemoCard = (cardType) => {
    const demo = demoCards[cardType];
    if (demo) {
      setCardDetails(demo);
      setDetectedCardType(cardType);
      toast.info(`${cardType.charAt(0).toUpperCase() + cardType.slice(1)} card details filled`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setValidationErrors({});

    const errors = {};

    try {
      // Validate data
      if (paymentMethod === 'card') {
        if (!cardDetails.number) {
          errors.cardNumber = 'Card number is required';
        } else if (cardDetails.number.replace(/\s/g, '').length < 15) {
          errors.cardNumber = 'Invalid card number';
        }

        if (!cardDetails.name) {
          errors.cardName = 'Cardholder name is required';
        }

        if (!cardDetails.expiry) {
          errors.cardExpiry = 'Expiry date is required';
        } else {
          // Validate expiry (basic check)
          const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
          if (!expiryRegex.test(cardDetails.expiry)) {
            errors.cardExpiry = 'Invalid expiry date (use MM/YY format)';
          }
        }

        if (!cardDetails.cvv) {
          errors.cardCvv = 'CVV is required';
        } else {
          // Validate CVV (basic check)
          const cvvLength = detectedCardType === 'amex' ? 4 : 3;
          if (cardDetails.cvv.length !== cvvLength) {
            errors.cardCvv = `CVV must be ${cvvLength} digits`;
          }
        }
      } else if (paymentMethod === 'upi') {
        if (!upiId) {
          errors.upi = 'UPI ID is required';
        } else if (!upiId.includes('@')) {
          errors.upi = 'Please enter a valid UPI ID (e.g. name@upi)';
        }
      } else if (paymentMethod === 'netbanking') {
        if (!netBankingBank) {
          errors.netbanking = 'Please select a bank';
        }
      } else if (paymentMethod === 'wallet') {
        if (!selectedWallet) {
          errors.wallet = 'Please select a wallet';
        }
      }

      // If there are validation errors, show them and stop the submission
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        throw new Error('Please fix the errors in the form');
      }

      // Show payment processing animation
      setIsProcessing(true);

      // Let the animation complete before processing the payment in the background
      setTimeout(async () => {
        try {
          // Store payment details in Firestore
          const paymentData = {
            userId: currentUser?.uid,
            orderId: orderId,
            amount: amount,
            paymentMethod: paymentMethod,
            paymentDetails:
              paymentMethod === 'card'
                ? {
                  cardType: detectedCardType,
                  lastFourDigits: cardDetails.number.replace(/\s/g, '').slice(-4)
                }
                : paymentMethod === 'upi'
                  ? { upiId }
                  : paymentMethod === 'wallet'
                    ? { walletType: selectedWallet }
                    : { bank: netBankingBank },
            status: 'completed',
            timestamp: new Date(),
          };

          await addPayment(paymentData);

          if (onPaymentSuccess) {
            onPaymentSuccess(paymentData);
          }
        } catch (error) {
          console.error('Payment storage error:', error);
          // Even if storage fails, we don't show this error to user since the animation already completed
        }
      }, 4000); // Give the animation time to complete

    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please fix the errors and try again.');
      setLoading(false);
    }
  };

  // Handle animation completion
  const handleAnimationComplete = () => {
    if (onPaymentSuccess) {
      // Create a dummy payment data object if needed
      const paymentData = {
        id: 'TX' + Math.random().toString(36).substring(2, 15),
        paymentMethod,
        orderId,
        amount,
        status: 'completed',
        timestamp: new Date()
      };

      // Notify parent of success
      onPaymentSuccess(paymentData);
    }
  };

  return (
    <Card className="w-full max-w-[95vw] sm:max-w-md mx-auto">
      <CardHeader className="px-4 md:px-6">
        <CardTitle className="text-xl md:text-2xl">Payment</CardTitle>
        <CardDescription className="text-sm md:text-base">
          Complete your payment of ₹{amount?.toFixed(2) || '0.00'}
        </CardDescription>
      </CardHeader>
      {isProcessing ? (
        <CardContent className="px-4 md:px-6 py-6 md:py-8">
          <PaymentProcessingAnimation
            cardType={detectedCardType || 'visa'}
            onComplete={handleAnimationComplete}
          />
        </CardContent>
      ) : (
        <CardContent className="px-3 sm:px-6">
          <Tabs defaultValue="card" onValueChange={setPaymentMethod}>
            <TabsList className="inline-flex w-full justify-around bg-gray-50 p-1 rounded-lg text-xs sm:text-sm overflow-x-auto">
              <TabsTrigger value="card" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center">
                    <img src={VisaLogo} alt="Card" className="h-4 sm:h-5 w-auto" />
                  </div>
                  <span>Card</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="upi" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">UPI</TabsTrigger>
              <TabsTrigger value="netbanking" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Net Banking</TabsTrigger>
              <TabsTrigger value="wallet" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Wallet</TabsTrigger>
            </TabsList>

            <TabsContent value="card" className="space-y-4 mt-3 sm:mt-4">
              <div className="flex justify-between items-center">
                <p className="text-xs sm:text-sm text-muted-foreground">Select card</p>
                <div className="flex gap-2 sm:gap-3 items-center">
                  {cardTypes.map(card => (
                    <button
                      key={card.id}
                      type="button"
                      className="hover:opacity-80 transition-opacity"
                      onClick={() => fillDemoCard(card.id)}
                      title={`Use ${card.name} demo card`}
                    >
                      <img src={card.logo} alt={card.name} className="h-5 sm:h-6 w-auto" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="card-number" className="text-xs sm:text-sm">Card Number</Label>
                <div className="relative">
                  <Input
                    id="card-number"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.number}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                    className={`${validationErrors.cardNumber ? "border-red-500" : ""} ${detectedCardType ? "pr-12" : ""} text-sm`}
                  />
                  {detectedCardType && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <img 
                        src={cardTypes.find(c => c.id === detectedCardType)?.logo} 
                        alt={cardTypes.find(c => c.id === detectedCardType)?.name} 
                        className="h-6 w-auto"
                      />
                    </div>
                  )}
                </div>
                {validationErrors.cardNumber && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.cardNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardholder-name" className="text-xs sm:text-sm">Cardholder Name</Label>
                <Input
                  id="cardholder-name"
                  placeholder="John Doe"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                  className={validationErrors.cardName ? "border-red-500 text-sm" : "text-sm"}
                />
                {validationErrors.cardName && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.cardName}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry" className="text-xs sm:text-sm">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={handleExpiryChange}
                    maxLength={5}
                    className={validationErrors.cardExpiry ? "border-red-500 text-sm" : "text-sm"}
                  />
                  {validationErrors.cardExpiry && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.cardExpiry}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv" className="text-xs sm:text-sm">CVV</Label>
                  <Input
                    id="cvv"
                    type="password"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                    maxLength={detectedCardType === 'amex' ? 4 : 3}
                    className={validationErrors.cardCvv ? "border-red-500 text-sm" : "text-sm"}
                  />
                  {validationErrors.cardCvv && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.cardCvv}</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="upi" className="space-y-4 mt-3 sm:mt-4">
              <div className="space-y-2">
                <Label htmlFor="upi-id" className="text-xs sm:text-sm">UPI ID</Label>
                <Input
                  id="upi-id"
                  placeholder="example@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className={validationErrors.upi ? "border-red-500 text-sm" : "text-sm"}
                />
                {validationErrors.upi && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.upi}</p>
                )}
              </div>
              <div className="flex items-center justify-center p-2 sm:p-4">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Enter your UPI ID to make the payment securely
                </p>
              </div>
            </TabsContent>

            <TabsContent value="netbanking" className="space-y-4 mt-3 sm:mt-4">
              <div className="space-y-2">
                <Label htmlFor="bank" className="text-xs sm:text-sm">Select Bank</Label>
                <Select
                  value={netBankingBank}
                  onValueChange={setNetBankingBank}
                >
                  <SelectTrigger className={validationErrors.netbanking ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select your bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map(bank => (
                      <SelectItem key={bank.id} value={bank.id}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.netbanking && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.netbanking}</p>
                )}
              </div>
              <div className="flex items-center justify-center p-2 sm:p-4">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  You will be redirected to your bank's website to complete the payment
                </p>
              </div>
            </TabsContent>

            <TabsContent value="wallet" className="space-y-4 mt-3 sm:mt-4">
              <div className="space-y-4">
                <Label className="text-xs sm:text-sm">Select Wallet</Label>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {wallets.map(wallet => (
                    <Button
                      key={wallet.id}
                      type="button"
                      variant="outline"
                      className={`h-16 sm:h-20 flex flex-col items-center justify-center gap-1 sm:gap-2 ${selectedWallet === wallet.id ? "border-primary" : ""} 
                      ${validationErrors.wallet && !selectedWallet ? "border-red-500" : ""}`}
                      onClick={() => {
                        setSelectedWallet(wallet.id);
                        // Clear validation error if it exists
                        if (validationErrors.wallet) {
                          setValidationErrors({ ...validationErrors, wallet: null });
                        }
                        toast.info(`${wallet.name} selected`);
                      }}
                    >
                      <div className="text-lg sm:text-xl">{wallet.logo}</div>
                      <span className="text-[10px] sm:text-xs">{wallet.name}</span>
                    </Button>
                  ))}
                </div>
                {validationErrors.wallet && (
                  <p className="text-xs text-red-500 mt-1">{validationErrors.wallet}</p>
                )}
              </div>
              <div className="flex items-center justify-center p-2 sm:p-4">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  You will be redirected to the wallet app to complete your payment
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 px-4 sm:px-6 py-4">
        {!isProcessing && (
          <>
            <Button variant="outline" onClick={onCancel} disabled={loading} className="w-full sm:w-auto order-2 sm:order-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto order-1 sm:order-2">
              {loading ? "Processing..." : `Pay ₹${amount?.toFixed(2) || '0.00'}`}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}

export default PaymentForm;
