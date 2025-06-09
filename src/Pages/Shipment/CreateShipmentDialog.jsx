import { useState, useEffect, useRef } from 'react';
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { Separator } from "../../Components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../Components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "../../Components/ui/dialog";
import { PaymentStatus } from "../../Components/ui/payment-status";
import { PaymentRecoveryAlert } from "../../Components/ui/payment-recovery-alert";
import { DraggableHandle } from "../../Components/ui/draggable-handle";
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../Firebase/sharedConfig';
import { useAuth } from '../../Context/AuthContext';
import { toast } from 'sonner';
import { cn } from "../../lib/utils";
import { 
  getRazorpayKey, 
  mapPaymentToFirestore, 
  detectPopupBlockers, 
  storePaymentSessionData, 
  getPaymentSessionData,
  clearPaymentSessionData
} from "../../Firebase/razorpayUtils";
import {
  initPaymentStateTracking,
  updatePaymentState,
  subscribeToPaymentStateChanges,
  clearPaymentState
} from "../../Firebase/paymentStateTracking";
import { createRazorpayOrder, loadRazorpayScript, verifyRazorpayPayment } from "../../Firebase/apiClient";

// We're now importing loadRazorpayScript from apiClient.js and utilities from razorpayUtils.js

// Debug function to help with Razorpay issues
const debugRazorpay = () => {
  console.log("Checking Razorpay status...");
  console.log("Razorpay globally available:", typeof window.Razorpay !== 'undefined');
  
  // Check if key is available
  const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
  console.log("Razorpay key configured:", rzpKey ? "Yes" : "No");
  
  // Check browser compatibility
  console.log("Browser user agent:", navigator.userAgent);
  
  // Check if there are any Razorpay iframes on the page that might indicate an orphaned checkout
  const iframes = document.querySelectorAll('iframe[src*="api.razorpay.com"]');
  console.log("Razorpay iframes found:", iframes.length > 0 ? "Yes" : "No", iframes);
};

// Function to check payment status by ID if needed for debugging
const checkPaymentStatus = async (paymentId) => {
  try {
    // This would use the backend in production
    console.log(`Would check payment status for ID: ${paymentId}`);
    // In a real implementation, we would call our backend:
    // const status = await getPaymentDetails(paymentId);
    return { status: "simulated" };
  } catch (error) {
    console.error("Error checking payment status:", error);
    return { error: error.message };
  }
};

function CreateShipmentDialog({ open, onOpenChange }) {
  const { currentUser } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    // Sender details
    fromName: currentUser?.displayName || '',
    fromEmail: currentUser?.email || '',
    fromPhone: '',
    fromStreet: '',
    fromCity: '',
    fromState: '',
    fromPincode: '',
    fromLandmark: '',

    // Recipient details
    toName: '',
    toEmail: '',
    toPhone: '',
    toStreet: '',
    toCity: '',
    toState: '',
    toPincode: '',
    toLandmark: '',

    // Package details
    weight: '',
    packageSize: 'Medium',
    packageCategory: 'Standard',
    packageDescription: '',
    
    // Additional options
    serviceType: 'Standard'
  });

  const [activeTab, setActiveTab] = useState("shipment-details");
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(null);
  const [razorpayActive, setRazorpayActive] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [paymentError, setPaymentError] = useState('');
  const [recoverySessionAvailable, setRecoverySessionAvailable] = useState(false);
  const [dialogPosition, setDialogPosition] = useState({ x: 0, y: 0 });
  const dialogContentRef = useRef(null);
  const razorpayInstanceRef = useRef(null);
  const sessionIdRef = useRef(`session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
  
  // Custom dialog open/close handler that prevents closing when Razorpay is active
  const handleDialogChange = (isOpen) => {
    // If trying to close dialog while Razorpay is active, prevent it and show warning
    if (!isOpen && razorpayActive) {
      console.log("Cannot close dialog while payment is in progress");
      toast.warning("Please complete or cancel the payment before closing this dialog");
      return;
    }
    
    // If dialog is being closed and user has entered data, confirm they want to lose their progress
    if (!isOpen && 
        (formData?.fromName || formData?.toName || formData?.weight) && 
        !razorpayActive) {
      // Ask for confirmation
      const confirmClose = window.confirm("Are you sure you want to close this dialog? Your shipment data will be lost.");
      if (!confirmClose) {
        return; // User cancelled, don't close
      }
      
      // User confirmed closing, clear any saved session
      clearPaymentSessionData();
    }
    
    // Otherwise proceed with normal close
    onOpenChange(isOpen);
  };
  
  // Run debug and check for interrupted payment sessions on component mount
  useEffect(() => {
    if (open) {
      debugRazorpay();
      
      // Check if we have an interrupted payment session
      const savedSession = getPaymentSessionData();
      if (savedSession) {
        console.log("Found interrupted payment session:", savedSession);
        setRecoverySessionAvailable(true);
      } else {
        setRecoverySessionAvailable(false);
      }
    }
  }, [open]);
  
  // Handler for recovering a payment session
  const handleRecoverSession = () => {
    const savedSession = getPaymentSessionData();
    if (savedSession) {
      // Restore the form data and price
      if (savedSession.formData) {
        setFormData(savedSession.formData);
      }
      
      if (savedSession.price) {
        setPrice(savedSession.price);
        setActiveTab("payment");
      }
      
      toast.info("Payment session restored. You can continue with your payment.");
      setRecoverySessionAvailable(false);
    }
  };
  
  // Handler for discarding a payment session
  const handleDiscardSession = () => {
    clearPaymentSessionData();
    setRecoverySessionAvailable(false);
  };
  
  // Handle dialog closing separately as a cleanup mechanism
  useEffect(() => {
    if (!open && razorpayActive) {
      console.log("Dialog closed while Razorpay was active, cleaning up state");
      
      // Store the current session in case user wants to come back
      storePaymentSessionData({
        formData,
        price,
        paymentActive: true,
        timestamp: new Date().toISOString()
      });
      
      setRazorpayActive(false);
      
      // Show a toast to inform the user they can resume later
      toast.info("Payment window is still open. You can resume payment later.");
    }
    
    // Cleanup when component is unmounted
    return () => {
      if (razorpayActive) {
        console.log("Component unmounting while Razorpay was active, cleaning up state");
        
        // Store the session data before unmounting
        storePaymentSessionData({
          formData,
          price,
          paymentActive: true,
          timestamp: new Date().toISOString()
        });
        
        setRazorpayActive(false);
      }
    };
  }, [open, razorpayActive, formData, price]);
  
  // Add protection against browser/tab closing during payment
  useEffect(() => {
    // Only add the event listener if Razorpay is active
    if (razorpayActive) {
      const handleBeforeUnload = (e) => {
        // Standard way to show a confirmation dialog before leaving
        e.preventDefault();
        e.returnValue = "You have a payment in progress. Are you sure you want to leave?";
        return "You have a payment in progress. Are you sure you want to leave?";
      };
      
      // Add protection against browser back button during payment
      const handlePopState = (e) => {
        // Prevent navigation and restore history state
        window.history.pushState(null, '', window.location.href);
        
        // Show toast warning
        toast.warning("Payment is in progress. Please complete or cancel it before navigating away.");
        
        // Prevent default navigation
        e.preventDefault();
        return false;
      };
      
      // Add history state to prevent back button navigation
      window.history.pushState(null, '', window.location.href);
      
      // Add event listeners
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);
      
      // Cleanup function to remove event listeners
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [razorpayActive]);
  
  // Component cleanup
  useEffect(() => {
    return () => {
      // When component unmounts, clean up Razorpay instance if it exists
      if (razorpayInstanceRef.current) {
        try {
          // Remove the overlay if it exists
          if (razorpayInstanceRef.current.overlay) {
            razorpayInstanceRef.current.overlay.remove();
          }
          
          // Close any active Razorpay frame
          razorpayInstanceRef.current.close();
          
          // Reset dialog z-index
          const dialogs = document.querySelectorAll('[role="dialog"]');
          dialogs.forEach(dialog => {
            dialog.style.zIndex = '';
          });
          
          // Clear reference
          razorpayInstanceRef.current = null;
          
          // Clean up any orphaned iframes
          const razorpayFrames = document.querySelectorAll('iframe[src*="api.razorpay.com"]');
          razorpayFrames.forEach(frame => {
            try {
              frame.remove();
            } catch (e) {
              console.error("Error removing Razorpay frame:", e);
            }
          });
        } catch (error) {
          console.error("Error closing Razorpay instance:", error);
        }
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name) => (value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate shipping cost
  const calculatePrice = () => {
    setLoading(true);

    // Base rate per kg
    const baseCostPerKg = 20; // ₹20 per kg
    
    // Size multipliers
    let sizeMultiplier = 1;
    switch(formData.packageSize) {
      case 'Small': sizeMultiplier = 1; break;
      case 'Medium': sizeMultiplier = 1.5; break;
      case 'Large': sizeMultiplier = 2.3; break;
      case 'Extra Large': sizeMultiplier = 3.5; break;
      default: sizeMultiplier = 1;
    }
    
    // Simulate distance cost (in a real app, this would use address geocoding and routing)
    const distance = 300 + Math.floor(Math.random() * 700); // 300-1000km
    const distanceRate = 10; // ₹10 per 100km
    const distanceCost = (distance / 100) * distanceRate;
    
    // Service type multiplier
    let serviceMultiplier = 1;
    switch(formData.serviceType) {
      case 'Express': serviceMultiplier = 1.5; break;
      case 'Priority': serviceMultiplier = 2; break;
      default: serviceMultiplier = 1;
    }
    
    // Calculate total shipping cost
    const shippingCost = (parseFloat(formData.weight) * baseCostPerKg * sizeMultiplier * serviceMultiplier) + distanceCost;
    
    // Calculate delivery days based on service type and distance
    const baseDeliverySpeed = 300; // km per day for standard shipping
    let deliverySpeedMultiplier;
    switch(formData.serviceType) {
      case 'Express': deliverySpeedMultiplier = 2; break; // 2x faster
      case 'Priority': deliverySpeedMultiplier = 3; break; // 3x faster
      default: deliverySpeedMultiplier = 1;
    }
    
    const estimatedDeliveryDays = Math.ceil(distance / (baseDeliverySpeed * deliverySpeedMultiplier));
    
    setTimeout(() => {
      setPrice({
        distance,
        estimatedDeliveryDays,
        cost: {
          baseCost: (parseFloat(formData.weight) * baseCostPerKg).toFixed(2),
          sizeMultiplier,
          distanceCost: distanceCost.toFixed(2),
          serviceMultiplier,
          totalAmount: shippingCost.toFixed(2),
          currency: "INR"
        }
      });
      
      setLoading(false);
      // Move to payment tab after calculation
      setActiveTab("payment");
    }, 1000);
  };

  // Handle payment with Razorpay
  const handlePayment = async () => {
    try {
      setLoading(true);
      
      // Load Razorpay script first
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      const orderData = {
        amount: parseFloat(price.cost.totalAmount),
        notes: {
          fromCity: formData.fromCity,
          toCity: formData.toCity,
          weight: formData.weight,
          packageType: formData.packageSize,
          serviceType: formData.serviceType
        }
      };
      const orderResponse = await createRazorpayOrder(orderData);
      
      // Clean Razorpay options with no duplicates
      const options = {
        key: await getRazorpayKey(),
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: 'FreightFox',
        description: 'Payment for shipment',
        order_id: orderResponse.id,
        prefill: {
          name: formData.fromName,
          email: formData.fromEmail,
          contact: formData.fromPhone
        },
        theme: {
          color: '#2563EB'
        },
        modal: {
          confirm_close: true,
          escape: false,
          handleback: true,
          backdropclose: false,
          animation: true,
          ondismiss: () => {
            // Remove overlay when Razorpay is dismissed
            if (razorpayInstanceRef.current?.overlay) {
              razorpayInstanceRef.current.overlay.remove();
            }
            // No need to modify dialog z-index anymore
            
            // Reset payment state when modal is dismissed
            setRazorpayActive(false);
            setPaymentStatus('idle');
          }
        },
        handler: function(response) {
          setRazorpayActive(false);
          setPaymentStatus('success');
          createShipmentInFirebase(response);
        }
      };

      // Set Razorpay active state before opening the modal
      setRazorpayActive(true);

      // Create new Razorpay instance
      const rzp = new window.Razorpay(options);
      
      // Store reference to allow updates
      razorpayInstanceRef.current = rzp;

      // Add event listeners for modal state
      rzp.on('payment.failed', function(response) {
        setRazorpayActive(false);
        setPaymentStatus('error');
        setPaymentError(response.error.description);
      });

      // Create a simple overlay that will be removed when Razorpay opens
      // This prevents interaction with our dialog while Razorpay loads
      const overlay = document.createElement('div');
      overlay.className = 'razorpay-overlay';
      overlay.style.position = 'fixed';
      overlay.style.inset = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      overlay.style.zIndex = '9998'; // Set z-index lower than Razorpay's default
      document.body.appendChild(overlay);
      
      // Store reference to overlay for cleanup
      razorpayInstanceRef.current.overlay = overlay;
      
      // Open the payment modal after setting up the overlay
      rzp.open();

    } catch (error) {
      console.error('Payment initialization error:', error);
      setRazorpayActive(false);
      setPaymentStatus('error');
      setPaymentError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Create shipment record in Firebase
  const createShipmentInFirebase = async (paymentResponse) => {
    try {
      console.log("Payment successful, response:", paymentResponse);
      
      // Make sure razorpayActive is false
      if (razorpayActive) {
        setRazorpayActive(false);
      }
      
      // Validate payment response
      if (!paymentResponse.razorpay_payment_id) {
        throw new Error("Invalid payment response from Razorpay");
      }
      
      // Generate tracking ID
      const trackingId = `TRK-${Math.floor(100000 + Math.random() * 900000)}`;
      
      // Generate order ID
      const orderId = Math.floor(10000000 + Math.random() * 90000000).toString();
      
      // Calculate estimated arrival date
      const arrivalDate = new Date();
      arrivalDate.setDate(arrivalDate.getDate() + price.estimatedDeliveryDays);
      
      // Create shipment object
      const shipment = {
        orderId,
        trackingId,
        userId: currentUser.uid,
        userName: currentUser.displayName || '',
        userEmail: currentUser.email || '',
        
        // Using the new direct from/to structure
        from: {
          name: formData.fromName,
          email: formData.fromEmail,
          phone: formData.fromPhone,
          street: formData.fromStreet,
          city: formData.fromCity,
          state: formData.fromState,
          pincode: formData.fromPincode,
          landmark: formData.fromLandmark || '',
        },
        
        to: {
          name: formData.toName,
          email: formData.toEmail,
          phone: formData.toPhone,
          street: formData.toStreet,
          city: formData.toCity,
          state: formData.toState,
          pincode: formData.toPincode,
          landmark: formData.toLandmark || '',
        },
        
        packageDetails: {
          weight: parseFloat(formData.weight),
          size: formData.packageSize,
          category: formData.packageCategory,
          description: formData.packageDescription || `${formData.packageSize} ${formData.packageCategory} package`
        },
        
        // Additional shipping details
        distance: price.distance,
        estimatedDeliveryDays: price.estimatedDeliveryDays,
        serviceType: formData.serviceType,
        
        // Status and timestamps
        status: 'Processing',
        createdAt: serverTimestamp(),
        
        // Payment details
        payment: {
          id: paymentResponse.razorpay_payment_id,
          orderId: paymentResponse.razorpay_order_id,
          signature: paymentResponse.razorpay_signature,
          status: 'completed'
        },
        
        // Cost details
        cost: price.cost,
        
        // For display in dashboard
        route: `${formData.fromCity} → ${formData.toCity}`,
        arrival: `${price.estimatedDeliveryDays}d - ${formData.toCity}`,
        category: formData.packageCategory
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'Orders'), shipment);
      console.log("Shipment created with ID:", docRef.id);
      
      // Show success and close dialog
      toast.success("Shipment created successfully!");
      
      // Clear all payment state
      clearPaymentSessionData();
      clearPaymentState();
      
      onOpenChange(false);
      
      // Reset form
      setFormData({
        fromName: currentUser?.displayName || '',
        fromEmail: currentUser?.email || '',
        fromPhone: '',
        fromStreet: '',
        fromCity: '',
        fromState: '',
        fromPincode: '',
        fromLandmark: '',
        toName: '',
        toEmail: '',
        toPhone: '',
        toStreet: '',
        toCity: '',
        toState: '',
        toPincode: '',
        toLandmark: '',
        weight: '',
        packageSize: 'Medium',
        packageCategory: 'Standard',
        packageDescription: '',
        serviceType: 'Standard'
      });
      setActiveTab("shipment-details");
      setPrice(null);
      
    } catch (error) {
      console.error("Error creating shipment:", error);
      toast.error("Failed to create shipment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form data before calculating price
    const requiredFields = [
      'fromName', 'fromPhone', 'fromStreet', 'fromCity', 'fromState', 'fromPincode',
      'toName', 'toPhone', 'toStreet', 'toCity', 'toState', 'toPincode',
      'weight'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast.error("Please fill all required fields");
      return;
    }
    
    calculatePrice();
  };

  const handleContinue = () => {
    handlePayment();
  };

  // Set up cross-window payment state tracking
  useEffect(() => {
    // Subscribe to payment state changes from other windows
    const unsubscribe = subscribeToPaymentStateChanges((newState) => {
      console.log("Payment state updated from another window:", newState);
      
      // Update our UI based on state changes from other windows
      if (newState.state === 'completed') {
        // Payment completed in another window
        if (razorpayActive) {
          toast.success("Payment completed in another window!");
          setRazorpayActive(false);
          setPaymentStatus('success');
          
          // If payment was successful, create the shipment
          if (newState.data && newState.data.paymentResponse) {
            createShipmentInFirebase(newState.data.paymentResponse);
          }
        }
      } else if (newState.state === 'failed') {
        // Payment failed in another window
        if (razorpayActive) {
          const errorMessage = newState.data?.error || "Payment failed in another window";
          toast.error(errorMessage);
          setRazorpayActive(false);
          setPaymentStatus('error');
          setPaymentError(errorMessage);
        }
      } else if (newState.state === 'cancelled') {
        // Payment cancelled in another window
        if (razorpayActive) {
          toast.info("Payment was cancelled in another window");
          setRazorpayActive(false);
          setPaymentStatus('idle');
        }
      }
    });
    
    // Cleanup listener when component unmounts
    return () => {
      unsubscribe();
    };
  }, [razorpayActive]);
  
  // Function to check if Razorpay iframe exists but might be hidden or behind dialog
  const checkRazorpayVisibility = () => {
    // Look for Razorpay iframe in the DOM
    const razorpayFrames = document.querySelectorAll('iframe[src*="api.razorpay.com"]');
    
    if (razorpayFrames.length > 0) {
      // Razorpay is loaded, get the frame
      const frame = razorpayFrames[0];
      
      // Don't modify the Razorpay iframe z-index - let Razorpay handle it
      // Only check for visibility

      const rect = frame.getBoundingClientRect();
      
      // Check if frame is hidden or outside viewport
      if (
        rect.width === 0 || 
        rect.height === 0 || 
        rect.top < 0 || 
        rect.left < 0 ||
        rect.bottom > window.innerHeight ||
        rect.right > window.innerWidth
      ) {
        console.log("Razorpay checkout exists but may be hidden");
        return { exists: true, visible: false, frame };
      }
      
      return { exists: true, visible: true, frame };
    }
    
    return { exists: false, visible: false, frame: null };
  };
  
  // Add periodic check for Razorpay visibility when active
  useEffect(() => {
    if (!razorpayActive) return;
    
    // Check visibility every 2 seconds
    const intervalId = setInterval(() => {
      const { exists, visible, frame } = checkRazorpayVisibility();
      
      if (exists && !visible && paymentStatus !== 'error') {
        // Razorpay exists but might be hidden - show a toast
        toast.info("Payment window may be hidden. Look for a window titled 'Razorpay Checkout'", {
          id: 'razorpay-visibility',
          duration: 5000
        });
        
        // We no longer try to modify the iframe's z-index
        // Let Razorpay handle its own rendering
      }
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, [razorpayActive, paymentStatus]);
  
  // Handle Razorpay test mode overlay to ensure it doesn't block interaction
  useEffect(() => {
    // Only run when Razorpay is active
    if (!razorpayActive) return;
    
    // Give time for Razorpay to render its elements
    const timeoutId = setTimeout(() => {
      const testModeOverlay = document.querySelector('.razorpay-test-mode-overlay');
      if (testModeOverlay) {
        // Make sure test mode overlay doesn't block pointer events
        // This allows clicking through it to the payment options
        testModeOverlay.style.pointerEvents = 'none';
        
        // Force any inner element's pointer events to be enabled
        const testModeText = document.querySelector('.razorpay-test-mode-text');
        if (testModeText) {
          testModeText.style.pointerEvents = 'none';
        }
        
        console.log('Fixed Razorpay test mode overlay interaction');
      }
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [razorpayActive]);

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent 
        className={cn(
          "w-full max-w-4xl",
          "max-h-[85vh] overflow-y-auto",
          // When Razorpay is active, disable pointer events and adjust z-index
          razorpayActive && "pointer-events-none relative"
        )}
        style={{
          // When Razorpay is active, ensure dialog has a lower z-index
          ...(razorpayActive ? { zIndex: "100" } : {})
        }}
      >
        {/* Add draggable handle when Razorpay is active */}
        <DraggableHandle 
          enabled={razorpayActive} 
          onPositionChange={setDialogPosition} 
        />
        
        <DialogHeader>
          <DialogTitle>
            Create New Shipment
            {razorpayActive && (
              <span className="ml-2 text-xs text-amber-600">
                (Drag from top to move dialog)
              </span>
            )}
          </DialogTitle>
          <div className="space-y-2">
            <DialogDescription>
              Enter shipment details and process payment to create a new shipment
            </DialogDescription>
            {razorpayActive && (
              <div className="text-sm font-medium text-amber-600 bg-amber-50 p-2 rounded-md border border-amber-200">
                Payment window is open. Please complete or cancel the payment before closing this dialog.
              </div>
            )}
          </div>
        </DialogHeader>
        
        {/* Show recovery alert if there's a saved payment session */}
        {recoverySessionAvailable && (
          <PaymentRecoveryAlert 
            onRecover={handleRecoverSession} 
            onDiscard={handleDiscardSession} 
          />
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="shipment-details">Shipment Details</TabsTrigger>
            <TabsTrigger value="payment" disabled={!price}>Payment</TabsTrigger>
          </TabsList>
          
          <TabsContent value="shipment-details">
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sender Information */}
                <div className="space-y-4">
                  <h3 className="font-medium text-base">Sender Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fromName">Full Name *</Label>
                    <Input
                      id="fromName"
                      name="fromName"
                      value={formData.fromName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fromEmail">Email</Label>
                      <Input
                        id="fromEmail"
                        name="fromEmail"
                        type="email"
                        value={formData.fromEmail}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fromPhone">Phone Number *</Label>
                      <Input
                        id="fromPhone"
                        name="fromPhone"
                        value={formData.fromPhone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fromStreet">Street Address *</Label>
                    <Input
                      id="fromStreet"
                      name="fromStreet"
                      value={formData.fromStreet}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fromCity">City *</Label>
                      <Input
                        id="fromCity"
                        name="fromCity"
                        value={formData.fromCity}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fromState">State *</Label>
                      <Input
                        id="fromState"
                        name="fromState"
                        value={formData.fromState}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fromPincode">Pincode *</Label>
                      <Input
                        id="fromPincode"
                        name="fromPincode"
                        value={formData.fromPincode}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fromLandmark">Landmark</Label>
                      <Input
                        id="fromLandmark"
                        name="fromLandmark"
                        value={formData.fromLandmark}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Recipient Information */}
                <div className="space-y-4">
                  <h3 className="font-medium text-base">Recipient Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="toName">Full Name *</Label>
                    <Input
                      id="toName"
                      name="toName"
                      value={formData.toName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="toEmail">Email</Label>
                      <Input
                        id="toEmail"
                        name="toEmail"
                        type="email"
                        value={formData.toEmail}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="toPhone">Phone Number *</Label>
                      <Input
                        id="toPhone"
                        name="toPhone"
                        value={formData.toPhone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="toStreet">Street Address *</Label>
                    <Input
                      id="toStreet"
                      name="toStreet"
                      value={formData.toStreet}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="toCity">City *</Label>
                      <Input
                        id="toCity"
                        name="toCity"
                        value={formData.toCity}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="toState">State *</Label>
                      <Input
                        id="toState"
                        name="toState"
                        value={formData.toState}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="toPincode">Pincode *</Label>
                      <Input
                        id="toPincode"
                        name="toPincode"
                        value={formData.toPincode}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="toLandmark">Landmark</Label>
                      <Input
                        id="toLandmark"
                        name="toLandmark"
                        value={formData.toLandmark}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />
              
              {/* Package Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-base">Package Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg) *</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      value={formData.weight}
                      onChange={handleChange}
                      min="0.1"
                      step="0.1"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="packageSize">Package Size</Label>
                    <Select 
                      value={formData.packageSize} 
                      onValueChange={handleSelectChange('packageSize')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Small">Small</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Large">Large</SelectItem>
                        <SelectItem value="Extra Large">Extra Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="packageCategory">Package Category</Label>
                    <Select 
                      value={formData.packageCategory} 
                      onValueChange={handleSelectChange('packageCategory')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Clothing">Clothing</SelectItem>
                        <SelectItem value="Food">Food</SelectItem>
                        <SelectItem value="Books">Books</SelectItem>
                        <SelectItem value="Home Goods">Home Goods</SelectItem>
                        <SelectItem value="Medical Supplies">Medical Supplies</SelectItem>
                        <SelectItem value="Auto Parts">Auto Parts</SelectItem>
                        <SelectItem value="Furniture">Furniture</SelectItem>
                        <SelectItem value="Standard">Standard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="serviceType">Service Type</Label>
                    <Select 
                      value={formData.serviceType} 
                      onValueChange={handleSelectChange('serviceType')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Express">Express</SelectItem>
                        <SelectItem value="Priority">Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="packageDescription">Package Description</Label>
                  <Input
                    id="packageDescription"
                    name="packageDescription"
                    value={formData.packageDescription}
                    onChange={handleChange}
                    placeholder="Brief description of the package contents"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Calculating...
                    </>
                  ) : "Continue to Payment"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="payment">
            {price && (
              <div className="space-y-6 py-4">
                {paymentStatus !== 'idle' && (
                  <PaymentStatus status={paymentStatus} errorMessage={paymentError} />
                )}
                <div className="space-y-4">
                  <h3 className="font-medium text-base">Shipping Summary</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">From</div>
                      <div className="font-medium">{formData.fromCity}, {formData.fromState}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">To</div>
                      <div className="font-medium">{formData.toCity}, {formData.toState}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Package Weight</div>
                      <div className="font-medium">{formData.weight} kg</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Package Type</div>
                      <div className="font-medium">{formData.packageSize} ({formData.packageCategory})</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Service Type</div>
                      <div className="font-medium">{formData.serviceType}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Est. Delivery Time</div>
                      <div className="font-medium">{price.estimatedDeliveryDays} days</div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">Distance</div>
                    <div className="font-medium">{price.distance} km</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-medium text-base">Price Breakdown</h3>
                  
                  <div className="flex justify-between">
                    <span>Base Shipping Cost:</span>
                    <span>₹{price.cost.baseCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size Adjustment (x{price.cost.sizeMultiplier}):</span>
                    <span>₹{(price.cost.baseCost * price.cost.sizeMultiplier).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Distance Cost:</span>
                    <span>₹{price.cost.distanceCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Premium (x{formData.serviceType !== 'Standard' ? price.cost.serviceMultiplier : '1'}):</span>
                    <span>₹{(parseFloat(price.cost.totalAmount) - parseFloat(price.cost.distanceCost) - parseFloat(price.cost.baseCost)).toFixed(2)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold">
                    <span>Total Amount:</span>
                    <span>₹{price.cost.totalAmount}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-center space-y-2 pt-4">
                  <div className="text-center text-sm text-gray-500 mb-2">
                    Proceed to pay with Razorpay to create your shipment
                  </div>
                  <Button className="w-full" onClick={handleContinue} disabled={loading}>
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : "Pay ₹" + price.cost.totalAmount}
                  </Button>
                  <div className="text-xs text-gray-500 text-center mt-2 flex items-center justify-center">
                    <span>Secured by</span>
                    <img 
                      src="https://razorpay.com/assets/razorpay-glyph.svg" 
                      alt="Razorpay" 
                      className="h-4 ml-2" 
                    />
                  </div>
                  <div className="text-xs text-gray-500 text-center mt-4 border-t pt-4 w-full">
                    <p className="font-medium mb-1">For testing, use these card details:</p>
                    <p>Card number: 4111 1111 1111 1111</p>
                    <p>Expiry: Any future date</p>
                    <p>CVV: Any 3 digits</p>
                    <p>Name: Any name</p>
                    <p>OTP: 1111</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default CreateShipmentDialog;
