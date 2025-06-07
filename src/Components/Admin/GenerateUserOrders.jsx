import { useState } from 'react';
import { generateHistoricalOrders } from '../../Firebase/generateUserOrders.js';
import { Button } from '../ui/button';

export function GenerateUserOrders() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerateOrders = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const generationResult = await generateHistoricalOrders();
      setResult(generationResult);
      
    } catch (err) {
      console.error('Error generating orders:', err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Generate Historical Orders for Existing Users</h2>
      
      <div className="mb-6">
        <p className="text-gray-700 mb-2">
          This tool will generate orders for all authenticated users in the system. 
          Each user will receive:
        </p>
        <ul className="list-disc pl-5 text-gray-600">
          <li>1-3 orders in the current month</li>
          <li>1-3 orders for each of the past 5 months</li>
        </ul>
        <p className="text-gray-700 mt-2">
          Orders will have varying statuses based on their dates and will include
          all necessary details like shipping information, tracking IDs, and costs.
        </p>
      </div>
      
      <Button 
        onClick={handleGenerateOrders}
        disabled={isGenerating}
        className="w-full"
      >
        {isGenerating ? 'Generating Orders...' : 'Generate Historical Orders'}
      </Button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-medium">Error generating orders:</p>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          <p className="font-medium">Order generation successful:</p>
          <ul className="list-disc pl-5">
            <li>Users processed: {result.userCount}</li>
            <li>Orders created: {result.orderCount}</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default GenerateUserOrders;
