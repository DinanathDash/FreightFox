import { useState, useEffect, useRef } from 'react';
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { Separator } from "../../Components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "../../Components/ui/dialog";
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../Firebase/shared/sharedConfig';
import { useAuth } from '../../Context/AuthContext';
import { toast } from 'sonner';
import { cn } from "../../lib/utils";
import PaymentDialog from "../../Components/Payment/PaymentDialog";

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

  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [createdShipmentId, setCreatedShipmentId] = useState(null);
  const dialogContentRef = useRef(null);
  
  // Custom dialog open/close handler
  const handleDialogChange = (isOpen) => {
    // If dialog is being closed and user has entered data, confirm they want to lose their progress
    if (!isOpen && (formData?.fromName || formData?.toName || formData?.weight)) {
      // Ask for confirmation
      const confirmClose = window.confirm("Are you sure you want to close this dialog? Your shipment data will be lost.");
      if (!confirmClose) {
        return; // User cancelled, don't close
      }
    }
    
    // Otherwise proceed with normal close
    onOpenChange(isOpen);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Calculate shipment price based on inputs
  const calculatePrice = () => {
    // Simple algorithm to calculate price (replace with your business logic)
    const sizeMultiplier = 
      formData.packageSize === 'Small' ? 1.0 : 
      formData.packageSize === 'Medium' ? 1.5 : 
      formData.packageSize === 'Large' ? 2.0 : 
      formData.packageSize === 'Extra Large' ? 2.5 : 1.0;
      
    const serviceMultiplier = 
      formData.serviceType === 'Express' ? 1.5 :
      formData.serviceType === 'Same Day' ? 2.0 :
      formData.serviceType === 'Next Day' ? 1.8 : 1.0;
    
    // Added category multiplier similar to the PriceCalculator
    const categoryMultiplier = 
      formData.packageCategory === 'Fragile' ? 1.2 : 
      formData.packageCategory === 'Electronics' ? 1.3 :
      formData.packageCategory === 'Perishable' ? 1.4 : 1.0;
      
    const weight = parseFloat(formData.weight) || 1;
    
    // Base price + size, service and category adjustments + weight factor
    const calculatedPrice = (300 * sizeMultiplier * serviceMultiplier * categoryMultiplier) + (weight * 50);
    
    // Round to 2 decimal places
    return Math.round(calculatedPrice * 100) / 100;
  };
  
  // Validate form data
  const validateForm = () => {
    if (!formData.fromName) return "Sender name is required";
    if (!formData.fromPhone) return "Sender phone number is required";
    if (!formData.fromCity) return "Sender city is required";
    
    if (!formData.toName) return "Recipient name is required";
    if (!formData.toPhone) return "Recipient phone number is required";
    if (!formData.toCity) return "Recipient city is required";
    
    if (!formData.weight) return "Package weight is required";
    
    return null; // No errors
  };
  
  // Calculate price
  const handleCalculatePrice = () => {
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }
    
    const calculatedPrice = calculatePrice();
    setPrice(calculatedPrice);
    
    toast.success(`Price calculated: ₹${calculatedPrice}`);
  };
  
  // Create shipment record in Firebase
  const createShipmentInFirebase = async () => {
    try {
      setLoading(true);
      
      const calculatedPrice = calculatePrice();
      
      // Create shipment record - ensure structure matches the display components
      const shipmentData = {
        // User and timestamp info
        userId: currentUser?.uid,
        userEmail: currentUser?.email,
        customerEmail: currentUser?.email,
        customerName: currentUser?.displayName || formData.fromName,
        customerPhone: formData.fromPhone,
        createdAt: serverTimestamp(),
        timestamp: serverTimestamp(),
        
        // Order tracking info - use 8-digit numeric format
        orderId: generateTrackingNumber(), // Generate 8-digit numeric ID for tracking
        status: "Pending Payment", // Change status to pending payment
        carrier: "FreightFox",
        serviceType: formData.serviceType,
        
        // Addresses - maintain two formats for compatibility
        // Original format
        sender: {
          name: formData.fromName,
          email: formData.fromEmail,
          phone: formData.fromPhone,
          address: {
            street: formData.fromStreet,
            city: formData.fromCity,
            state: formData.fromState,
            pincode: formData.fromPincode,
            landmark: formData.fromLandmark
          }
        },
        recipient: {
          name: formData.toName,
          email: formData.toEmail,
          phone: formData.toPhone,
          address: {
            street: formData.toStreet,
            city: formData.toCity,
            state: formData.toState,
            pincode: formData.toPincode,
            landmark: formData.toLandmark
          }
        },
        
        // ShipmentDetails.jsx compatible format
        from: {
          street: formData.fromStreet,
          city: formData.fromCity,
          state: formData.fromState,
          pincode: formData.fromPincode,
          landmark: formData.fromLandmark
        },
        to: {
          street: formData.toStreet,
          city: formData.toCity,
          state: formData.toState,
          pincode: formData.toPincode,
          landmark: formData.toLandmark
        },
        
        // Package details - dual format for compatibility
        package: {
          weight: parseFloat(formData.weight),
          size: formData.packageSize,
          category: formData.packageCategory,
          description: formData.packageDescription
        },
        
        // ShipmentDetails.jsx compatible format
        packageDetails: {
          weight: parseFloat(formData.weight),
          dimensions: formData.packageSize,
          description: formData.packageDescription
        },
        packageType: formData.packageCategory,
        weight: parseFloat(formData.weight),
        itemCount: 1,
        
        // Cost and shipping
        shipping: {
          serviceType: formData.serviceType,
          price: calculatedPrice,
          currency: "INR",
          isPaid: true,
        },
        cost: {
          totalAmount: calculatedPrice,
          currency: "INR"
        },
        price: calculatedPrice,
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, "Orders"), shipmentData);
      
      // Set created shipment ID to use for payment
      setCreatedShipmentId(docRef.id);
      
      // Show intermediate success message
      toast.info(`Shipment created. Please complete payment to finalize.`);
      
      // Open payment dialog instead of closing
      setShowPaymentDialog(true);
      setLoading(false);
      
      return { success: true, shipmentId: docRef.id, status: 'pending_payment' };
    } catch (error) {
      console.error("Error creating shipment:", error);
      toast.error("Failed to create shipment. Please try again.");
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };
  
  // Generate a tracking number
  const generateTrackingNumber = () => {
    // Always generate an 8-digit number like "59125911" for consistency
    const min = 10000000;   // Minimum 8-digit number (10 million)
    const max = 99999999;   // Maximum 8-digit number (99.9 million)
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomNum.toString();
  };

  // Handle shipment creation
  const handleCreateShipment = async () => {
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }
    
    if (!price) {
      const calculatedPrice = calculatePrice();
      setPrice(calculatedPrice);
    }
    
    await createShipmentInFirebase();
  };
  
  // Handle payment completion
  const handlePaymentSuccess = async (paymentDetails) => {
    try {
      // Close payment dialog
      setShowPaymentDialog(false);
      
      // Success message with more detailed info
      toast.success(`Payment of ₹${price?.toFixed(2) || '0.00'} complete!`, {
        description: "Your shipment is confirmed and will be processed soon.",
        duration: 5000,
      });
      
      // Close the shipment creation dialog with a slight delay to give user time to see success message
      setTimeout(() => {
        onOpenChange(false);
      }, 500);
      
      // Reset form
      setFormData({
        // Sender details (keep from current user)
        fromName: currentUser?.displayName || '',
        fromEmail: currentUser?.email || '',
        fromPhone: '',
        fromStreet: '',
        fromCity: '',
        fromState: '',
        fromPincode: '',
        fromLandmark: '',
        
        // Reset recipient details
        toName: '',
        toEmail: '',
        toPhone: '',
        toStreet: '',
        toCity: '',
        toState: '',
        toPincode: '',
        toLandmark: '',
        
        // Reset package details
        weight: '',
        packageSize: 'Medium',
        packageCategory: 'Standard',
        packageDescription: '',
        
        // Reset service type
        serviceType: 'Standard'
      });
      
      setPrice(null);
      setCreatedShipmentId(null);
      
      // Close main dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating shipment after payment:", error);
      toast.error("There was a problem finalizing your payment.");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogContent 
          className={cn(
            "w-full max-w-[95vw] md:min-w-3xl",
            "max-h-[85vh] overflow-y-auto p-4 md:p-6"
          )}
          ref={dialogContentRef}
        >
          <DialogHeader className="flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-xl md:text-2xl">Create New Shipment</DialogTitle>
              <DialogDescription className="text-sm md:text-base">
                Enter shipment details to create your shipment.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Sender details */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Sender Details</h3>
              <div className="grid gap-2">
                <Label htmlFor="fromName">Full Name</Label>
                <Input 
                  id="fromName" 
                  name="fromName" 
                  value={formData.fromName}
                  onChange={handleChange}
                  placeholder="Enter sender's full name" 
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="fromEmail">Email Address</Label>
                  <Input 
                    id="fromEmail" 
                    name="fromEmail" 
                    type="email"
                    value={formData.fromEmail}
                    onChange={handleChange}
                    placeholder="Enter sender's email address" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fromPhone">Phone Number</Label>
                  <Input 
                    id="fromPhone" 
                    name="fromPhone" 
                    type="tel"
                    value={formData.fromPhone}
                    onChange={handleChange}
                    placeholder="Enter sender's phone number" 
                  />
                </div>
              </div>
            <div className="grid gap-2">
              <Label htmlFor="fromStreet">Street Address</Label>
              <Input 
                id="fromStreet" 
                name="fromStreet" 
                value={formData.fromStreet}
                onChange={handleChange}
                placeholder="Enter street address" 
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="fromCity">City</Label>
                <Input 
                  id="fromCity" 
                  name="fromCity"
                  value={formData.fromCity}
                  onChange={handleChange}
                  placeholder="Enter city" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fromState">State</Label>
                <Input 
                  id="fromState" 
                  name="fromState"
                  value={formData.fromState}
                  onChange={handleChange}
                  placeholder="Enter state" 
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="fromPincode">Pincode</Label>
                <Input 
                  id="fromPincode" 
                  name="fromPincode"
                  value={formData.fromPincode}
                  onChange={handleChange}
                  placeholder="Enter pincode" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fromLandmark">Landmark (Optional)</Label>
                <Input 
                  id="fromLandmark" 
                  name="fromLandmark"
                  value={formData.fromLandmark}
                  onChange={handleChange}
                  placeholder="Nearby landmark" 
                />
              </div>
            </div>
          </div>

          {/* Recipient details */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Recipient Details</h3>
            <div className="grid gap-2">
              <Label htmlFor="toName">Full Name</Label>
              <Input 
                id="toName" 
                name="toName"
                value={formData.toName}
                onChange={handleChange}
                placeholder="Enter recipient's full name" 
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="toEmail">Email Address</Label>
                <Input 
                  id="toEmail" 
                  name="toEmail" 
                  type="email"
                  value={formData.toEmail}
                  onChange={handleChange}
                  placeholder="Enter recipient's email address" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="toPhone">Phone Number</Label>
                <Input 
                  id="toPhone" 
                  name="toPhone" 
                  type="tel"
                  value={formData.toPhone}
                  onChange={handleChange}
                  placeholder="Enter recipient's phone number" 
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="toStreet">Street Address</Label>
              <Input 
                id="toStreet" 
                name="toStreet"
                value={formData.toStreet}
                onChange={handleChange}
                placeholder="Enter street address" 
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="toCity">City</Label>
                <Input 
                  id="toCity" 
                  name="toCity"
                  value={formData.toCity}
                  onChange={handleChange}
                  placeholder="Enter city" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="toState">State</Label>
                <Input 
                  id="toState" 
                  name="toState"
                  value={formData.toState}
                  onChange={handleChange}
                  placeholder="Enter state" 
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="toPincode">Pincode</Label>
                <Input 
                  id="toPincode" 
                  name="toPincode"
                  value={formData.toPincode}
                  onChange={handleChange}
                  placeholder="Enter pincode" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="toLandmark">Landmark (Optional)</Label>
                <Input 
                  id="toLandmark" 
                  name="toLandmark"
                  value={formData.toLandmark}
                  onChange={handleChange}
                  placeholder="Nearby landmark" 
                />
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Package details */}
        <div className="space-y-6">
          <h3 className="font-medium text-lg">Package Details</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input 
                id="weight" 
                name="weight" 
                type="number"
                value={formData.weight}
                onChange={handleChange}
                placeholder="Enter package weight" 
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="packageSize">Package Size</Label>
              <Select 
                value={formData.packageSize}
                onValueChange={(value) => handleSelectChange("packageSize", value)}
              >
                <SelectTrigger className="w-full">
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
            <div className="space-y-2">
              <Label htmlFor="packageCategory">Package Category</Label>
              <Select 
                value={formData.packageCategory}
                onValueChange={(value) => handleSelectChange("packageCategory", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Fragile">Fragile</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Documents">Documents</SelectItem>
                  <SelectItem value="Perishable">Perishable</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceType">Service Type</Label>
              <Select 
                value={formData.serviceType}
                onValueChange={(value) => handleSelectChange("serviceType", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard (3-5 business days)</SelectItem>
                  <SelectItem value="Express">Express (1-2 business days)</SelectItem>
                  <SelectItem value="Same Day">Same Day</SelectItem>
                  <SelectItem value="Next Day">Next Day</SelectItem>
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

        {price && (
          <div className="bg-muted p-3 md:p-4 rounded-lg mt-6">
            <div className="flex justify-between items-center text-base md:text-lg font-medium mb-2">
              <span>Estimated Cost:</span>
              <span>₹{price.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="space-y-1 text-xs sm:text-sm">
              <div className="flex justify-between flex-wrap">
                <span>Base Price:</span>
                <span>₹300.00</span>
              </div>
              <div className="flex justify-between flex-wrap">
                <span>Weight ({formData.weight} kg):</span>
                <span>₹{(parseFloat(formData.weight || 1) * 50).toFixed(2)}</span>
              </div>
              <div className="flex justify-between flex-wrap">
                <span>Package Size ({formData.packageSize}):</span>
                <span>
                  {formData.packageSize === 'Small' ? '×1.0' : 
                   formData.packageSize === 'Medium' ? '×1.5' : 
                   formData.packageSize === 'Large' ? '×2.0' : 
                   formData.packageSize === 'Extra Large' ? '×2.5' : '×1.0'}
                </span>
              </div>
              <div className="flex justify-between flex-wrap">
                <span>Package Category ({formData.packageCategory}):</span>
                <span>
                  {formData.packageCategory === 'Fragile' ? '×1.2' :
                   formData.packageCategory === 'Electronics' ? '×1.3' :
                   formData.packageCategory === 'Perishable' ? '×1.4' : '×1.0'}
                </span>
              </div>
              <div className="flex justify-between flex-wrap">
                <span>Service Type ({formData.serviceType}):</span>
                <span>
                  {formData.serviceType === 'Express' ? '×1.5' :
                   formData.serviceType === 'Same Day' ? '×2.0' :
                   formData.serviceType === 'Next Day' ? '×1.8' : '×1.0'}
                </span>
              </div>
            </div>
            <Separator className="my-2" />
            <div className="text-xs text-muted-foreground text-center md:text-left">
              Formula: Base Price × Size Multiplier × Category Multiplier × Service Multiplier + Weight Cost
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={handleCalculatePrice} className="w-full sm:w-auto">
              Calculate Price
            </Button>
            <Button onClick={handleCreateShipment} disabled={loading} className="w-full sm:w-auto">
              {loading ? "Processing..." : "Create Shipment"}
            </Button>
          </div>
        </div>
      </DialogContent>
      </Dialog>
      
      {/* Payment Dialog */}
      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        amount={price || 0}
        orderId={createdShipmentId}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
}

export default CreateShipmentDialog;
