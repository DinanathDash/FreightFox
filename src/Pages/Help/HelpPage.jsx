import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../Components/Dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from "../../Components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../Components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../Components/Help/Accordion";
import HelpArticle from './HelpArticle';
import { HelpCategories } from './HelpCategories';
import "./HelpPage.css";

function HelpPage() {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const frequentlyAskedQuestions = [
    {
      id: 'faq-1',
      question: 'How do I track my shipment?',
      answer: 'You can track your shipment by clicking on the Shipments tab in the sidebar, then finding your shipment in the list. Click on the shipment to view detailed tracking information including current status, location, and estimated delivery time.'
    },
    {
      id: 'faq-2',
      question: 'How do I create a new shipment?',
      answer: 'To create a new shipment, go to the Shipments page and click the "Create Shipment" button in the top right corner. Fill in the required details in the form and submit it to create your new shipment.'
    },
    {
      id: 'faq-3',
      question: 'Can I change the delivery address?',
      answer: 'Yes, you can change the delivery address for shipments that have not yet been dispatched. Go to the Shipments page, select your shipment, and click the "Edit" button. From there, you can update the delivery address.'
    },
    {
      id: 'faq-4',
      question: 'How do I cancel a shipment?',
      answer: 'To cancel a shipment, go to the Shipments page, select the shipment you want to cancel, and click on "View Details". In the details panel, you will find a "Cancel Shipment" option. Please note that shipments already in transit may incur cancellation fees.'
    },
    {
      id: 'faq-5',
      question: 'What payment methods do you accept?',
      answer: 'We accept credit cards (Visa, MasterCard, American Express), debit cards, and digital wallets like Google Pay and Apple Pay through our secure Razorpay payment gateway.'
    }
  ];

  const shipmentGuides = [
    {
      id: 'guide-1',
      title: 'Creating Your First Shipment',
      snippet: 'Learn how to create and manage your first shipment from start to finish.',
      content: `
# Creating Your First Shipment

Follow these steps to create your first shipment:

1. **Navigate to Shipments**: Click on the Shipments tab in the sidebar.
2. **Create New**: Click the "Create Shipment" button in the top right corner.
3. **Fill the Form**: Enter all required information:
   - Origin and destination addresses
   - Package dimensions and weight
   - Shipping service type
   - Sender and recipient details
4. **Review**: Double-check all information for accuracy.
5. **Submit**: Click "Create Shipment" to finalize your order.
6. **Payment**: Complete the payment process through our secure payment gateway.
7. **Confirmation**: You'll receive a confirmation email with tracking details.

Your shipment will be processed and you can track its progress from the Shipments page.
      `
    },
    {
      id: 'guide-2',
      title: 'Understanding Tracking Statuses',
      snippet: 'A comprehensive guide to all the tracking statuses and what they mean.',
      content: `
# Understanding Tracking Statuses

Our shipment tracking system uses the following statuses:

## Order Placed
Your order has been received and is being processed.

## Processing
Your shipment details are being verified and prepared for pickup.

## Picked Up
The package has been collected from the origin address.

## In Transit
The package is on its way to the destination.

## Out for Delivery
The package has arrived at the final distribution center and is out for delivery.

## Delivered
The package has been successfully delivered to the recipient.

## Exception
There's an issue with the delivery. Check the details for more information.

## Cancelled
The shipment has been cancelled.

Each status update includes a timestamp and, where applicable, location information to help you track your shipment's journey in real-time.
      `
    },
    {
      id: 'guide-3',
      title: 'Payment and Billing',
      snippet: 'Information about payment methods, invoices, and refund policies.',
      content: `
# Payment and Billing

## Payment Methods
We accept the following payment methods:
- Credit Cards (Visa, MasterCard, American Express)
- Debit Cards
- Google Pay
- Apple Pay
- Net Banking

## Billing Process
1. When you create a shipment, you'll receive a quote based on:
   - Package dimensions and weight
   - Distance between origin and destination
   - Selected shipping service

2. You can pay immediately during checkout.

3. For business accounts, we offer:
   - Monthly invoicing
   - Credit terms (subject to approval)
   - Bulk shipment discounts

## Invoices and Receipts
- Digital receipts are sent via email immediately after payment
- Monthly statements are available for business accounts
- All payment records can be accessed in the "Billing History" section

## Refund Policy
- Cancelled orders before pickup: Full refund
- Cancelled orders after pickup but before transit: 80% refund
- Cancelled orders in transit: Subject to case review
- Failed delivery attempts: No automatic refunds, contact support

For any billing inquiries, please contact our support team.
      `
    }
  ];

  const videoTutorials = [
    {
      id: 'video-1',
      title: 'Getting Started with FreightFox',
      videoUrl: 'https://www.example.com/videos/getting-started',
      thumbnail: 'thumbnail1.jpg',
      description: 'A quick overview of the FreightFox platform and its key features.'
    },
    {
      id: 'video-2',
      title: 'How to Track Shipments Effectively',
      videoUrl: 'https://www.example.com/videos/tracking-guide',
      thumbnail: 'thumbnail2.jpg',
      description: 'Learn how to use our advanced tracking features to monitor your shipments in real-time.'
    },
    {
      id: 'video-3',
      title: 'Managing Multiple Shipments',
      videoUrl: 'https://www.example.com/videos/batch-management',
      thumbnail: 'thumbnail3.jpg',
      description: 'Tips and tricks for efficiently managing multiple shipments simultaneously.'
    }
  ];
  
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    
    // Search in FAQs
    const matchingFaqs = frequentlyAskedQuestions.filter(faq => 
      faq.question.toLowerCase().includes(query) || 
      faq.answer.toLowerCase().includes(query)
    );
    
    // Search in guides
    const matchingGuides = shipmentGuides.filter(guide => 
      guide.title.toLowerCase().includes(query) || 
      guide.snippet.toLowerCase().includes(query) || 
      guide.content.toLowerCase().includes(query)
    );
    
    // Search in videos
    const matchingVideos = videoTutorials.filter(video => 
      video.title.toLowerCase().includes(query) || 
      video.description.toLowerCase().includes(query)
    );
    
    setSearchResults({
      faqs: matchingFaqs,
      guides: matchingGuides,
      videos: matchingVideos
    });
  }, [searchQuery]);

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">Help Center</h2>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full mb-4">
            <div className="absolute inset-y-0 start-0 flex items-center pl-3 pointer-events-none">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <input
              type="search"
              className="block w-full p-4 pl-12 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search for help topics, guides, or FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {selectedArticle ? (
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => setSelectedArticle(null)}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-2 w-fit"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back to Help Center
              </button>
              <HelpArticle article={selectedArticle} />
            </div>
          ) : searchResults ? (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSearchQuery("")}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-2 w-fit"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Back to all topics
                </button>
                <span className="text-gray-500">
                  Search results for: <span className="font-medium">"{searchQuery}"</span>
                </span>
              </div>

              {/* FAQs search results */}
              {searchResults.faqs.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Matching FAQs ({searchResults.faqs.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {searchResults.faqs.map((faq) => (
                        <AccordionItem key={faq.id} value={faq.id}>
                          <AccordionTrigger>{faq.question}</AccordionTrigger>
                          <AccordionContent>{faq.answer}</AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              )}
              
              {/* Guides search results */}
              {searchResults.guides.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Matching Guides ({searchResults.guides.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {searchResults.guides.map((guide) => (
                        <div 
                          key={guide.id} 
                          className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                          onClick={() => setSelectedArticle(guide)}
                        >
                          <h3 className="font-medium mb-2">{guide.title}</h3>
                          <p className="text-gray-600 text-sm">{guide.snippet}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Videos search results */}
              {searchResults.videos.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Matching Videos ({searchResults.videos.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {searchResults.videos.map((video) => (
                        <div key={video.id} className="border rounded-lg p-4">
                          <div className="bg-gray-200 h-32 flex items-center justify-center mb-3 rounded">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="white" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M15.5 12L10.5 15V9L15.5 12Z" fill="#555" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <h3 className="font-medium mb-2">{video.title}</h3>
                          <p className="text-gray-600 text-sm">{video.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* No results found */}
              {searchResults.faqs.length === 0 && searchResults.guides.length === 0 && searchResults.videos.length === 0 && (
                <Card>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400 mb-4">
                      <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 11H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h3 className="text-lg font-semibold mb-2">No results found</h3>
                    <p className="text-gray-600 mb-4">We couldn't find any content matching your search. Try different keywords or browse the categories below.</p>
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
                    >
                      View all help topics
                    </button>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Tabs defaultValue="faq" className="w-full">
              <HelpCategories onCategoryClick={(categoryId) => setSelectedCategory(categoryId)} />
              
              <TabsList className="grid w-full grid-cols-3 mb-8 mt-6">
                <TabsTrigger value="faq">Frequently Asked Questions</TabsTrigger>
                <TabsTrigger value="guides">Shipment Guides</TabsTrigger>
                <TabsTrigger value="videos">Video Tutorials</TabsTrigger>
              </TabsList>
              
              <TabsContent value="faq">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Frequently Asked Questions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {frequentlyAskedQuestions.map((faq) => (
                        <AccordionItem key={faq.id} value={faq.id}>
                          <AccordionTrigger>{faq.question}</AccordionTrigger>
                          <AccordionContent>{faq.answer}</AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="guides">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {shipmentGuides.map((guide) => (
                    <Card key={guide.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedArticle(guide)}>
                      <CardHeader>
                        <CardTitle>{guide.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">{guide.snippet}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="videos">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videoTutorials.map((video) => (
                    <Card key={video.id}>
                      <div className="bg-gray-200 h-40 flex items-center justify-center">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="white" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M15.5 12L10.5 15V9L15.5 12Z" fill="#555" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <CardHeader>
                        <CardTitle>{video.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">{video.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Can't find what you're looking for?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-gray-700">
                  Our support team is available 24/7 to answer your questions.
                </p>
                <Link to="/support" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.5 17.5L22 22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20 11C20 15.9706 15.9706 20 11 20C6.02944 20 2 15.9706 2 11C2 6.02944 6.02944 2 11 2C15.9706 2 20 6.02944 20 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M11 8V14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 11H14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Contact Support
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default HelpPage;
