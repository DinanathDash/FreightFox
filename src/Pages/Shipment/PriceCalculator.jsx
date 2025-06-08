import { useState } from 'react';
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { Separator } from "../../Components/ui/separator";

function PriceCalculator() {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    packageType: 'standard',
    serviceType: 'standard'
  });
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const calculatePrice = () => {
    setLoading(true);

    // This would typically be an API call to calculate the shipping price
    // For this example, we'll use a simple calculation
    
    setTimeout(() => {
      const { weight, length, width, height, packageType, serviceType } = formData;
      
      // Basic calculation
      let basePrice = parseFloat(weight) * 2; // $2 per kg
      const volume = parseFloat(length) * parseFloat(width) * parseFloat(height) / 5000; // Dimensional weight
      
      // Use the greater of actual weight or dimensional weight
      const chargeableWeight = Math.max(parseFloat(weight), volume);
      basePrice = chargeableWeight * 2;
      
      // Add package type premium
      if (packageType === 'fragile') basePrice *= 1.2; // 20% more for fragile
      if (packageType === 'heavy') basePrice *= 1.3; // 30% more for heavy
      
      // Add service type premium
      if (serviceType === 'express') basePrice *= 1.5; // 50% more for express
      if (serviceType === 'priority') basePrice *= 2; // 100% more for priority
      
      setPrice(basePrice.toFixed(2));
      setLoading(false);
    }, 1000); // Simulate API delay
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculatePrice();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="origin">Origin</Label>
          <Input 
            id="origin"
            name="origin"
            placeholder="City, Country" 
            value={formData.origin}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="destination">Destination</Label>
          <Input 
            id="destination"
            name="destination"
            placeholder="City, Country" 
            value={formData.destination}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="weight">Weight (kg)</Label>
        <Input 
          id="weight"
          name="weight"
          type="number" 
          placeholder="0.00" 
          value={formData.weight}
          onChange={handleChange}
          required
          min="0.1"
          step="0.1"
        />
      </div>

      <div className="space-y-2">
        <Label>Dimensions (cm)</Label>
        <div className="grid grid-cols-3 gap-4">
          <Input 
            name="length"
            placeholder="Length" 
            type="number" 
            value={formData.length}
            onChange={handleChange}
            required
            min="1"
          />
          <Input 
            name="width"
            placeholder="Width" 
            type="number" 
            value={formData.width}
            onChange={handleChange}
            required
            min="1"
          />
          <Input 
            name="height"
            placeholder="Height" 
            type="number" 
            value={formData.height}
            onChange={handleChange}
            required
            min="1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="packageType">Package Type</Label>
          <Select 
            value={formData.packageType} 
            onValueChange={handleSelectChange('packageType')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="fragile">Fragile</SelectItem>
              <SelectItem value="heavy">Heavy</SelectItem>
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
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="express">Express</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Calculating..." : "Calculate Price"}
      </Button>

      {price && (
        <>
          <Separator />
          <div className="text-center">
            <div className="text-gray-500">Estimated Price</div>
            <div className="text-2xl font-bold">${price}</div>
          </div>
        </>
      )}
    </form>
  );
}

export default PriceCalculator;
