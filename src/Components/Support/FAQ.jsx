import React, { useState } from 'react';
import { Card, CardContent } from "../../Components/ui/card";

function FAQ({ faqs }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleFAQ = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="space-y-3 md:space-y-4 px-2 sm:px-0">
      {faqs.map((faq, index) => (
        <Card 
          key={index} 
          className={`transition-shadow ${expandedIndex === index ? 'shadow-md' : 'shadow-sm'}`}
        >
          <CardContent className="p-0">
            <div 
              className={`p-3 md:p-4 cursor-pointer flex justify-between items-center ${expandedIndex === index ? 'border-b' : ''}`}
              onClick={() => toggleFAQ(index)}
            >
              <h3 className="font-medium text-gray-900 text-sm sm:text-base md:text-lg pr-2">{faq.question}</h3>
              <div className="text-blue-600 flex-shrink-0">
                {expandedIndex === index ? (
                  <svg width="16" height="16" className="sm:w-5 sm:h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" className="sm:w-5 sm:h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>
            {expandedIndex === index && (
              <div className="p-3 md:p-4 bg-gray-50 text-gray-700 text-xs sm:text-sm md:text-base">
                {faq.answer}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default FAQ;
