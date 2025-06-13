import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTickets } from '../../hooks/useTickets';
import DashboardLayout from '../../Components/Dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../Components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../Components/ui/tabs";
import { Input } from "../../Components/ui/input";
import { Button } from "../../Components/ui/button";
import { Label } from "../../Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { Checkbox } from "../../Components/ui/checkbox";
import { toast } from "sonner";
import ContactMethods from "../../Components/Support/ContactMethods";
import FAQ from "../../Components/Support/FAQ";
import TicketList from "../../Components/Support/TicketList";
import "./SupportPage.css";

function SupportPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTab, setSelectedTab] = useState("support-ticket");
  const [ticketCreated, setTicketCreated] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { tickets, isLoading, addTicket } = useTickets();
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      priority: "high",
      category: "shipment-issue",
      name: "Dinanath Dash",
      email: "dashdinanath056@gmail.com"
    }
  });
  
  const onSubmitSupportTicket = async (data) => {
    setIsSubmitting(true);
    try {
      // Create a new ticket using the addTicket function from useTickets
      const newTicket = await addTicket({
        subject: data.subject,
        message: data.message,
        category: data.category,
        priority: data.priority,
        orderNumber: data.orderNumber || null,
        createdAt: new Date(),
        lastUpdated: new Date(),
        status: "pending",
      });
      
      // Set the ticket number to display in confirmation
      setTicketNumber(newTicket.id);
      setTicketCreated(true);
      
      toast.success("Support ticket created successfully!");
      reset();
    } catch (error) {
      console.error("Error creating support ticket:", error);
      toast.error("Failed to create support ticket. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetTicketForm = () => {
    setTicketCreated(false);
    setTicketNumber("");
  };
  
  // Effect to set initial form values
  useEffect(() => {
    // Initialize form values for dropdown elements
    setValue("priority", "high");
    
    // For demonstration, we're pre-setting the shipment issue category
    // This simulates what happens when a user has already selected a category
    if (!errors.category) {
      setValue("category", "shipment-issue");
    }
  }, [setValue]);

  const supportCategories = [
    { value: "shipment-issue", label: "Shipment Issues" },
    { value: "payment", label: "Payment & Billing" },
    { value: "account", label: "Account Management" },
    { value: "technical", label: "Technical Support" },
    { value: "feedback", label: "Feedback & Suggestions" },
    { value: "other", label: "Other" }
  ];

  const priorityLevels = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" }
  ];

  const faqs = [
    {
      question: "How long does it take to get a response from support?",
      answer: "We aim to respond to all support tickets within 12-24 hours during business days. For urgent matters, our response time is typically under 4 hours."
    },
    {
      question: "Can I track the status of my support ticket?",
      answer: "Yes! You can track the status of your ticket by going to the 'My Tickets' tab and entering your ticket number or viewing your recent tickets."
    },
    {
      question: "What information should I include in my support request?",
      answer: "For the fastest resolution, please include: your order/shipment ID (if applicable), a detailed description of the issue, any error messages you've received, and screenshots if possible."
    },
    {
      question: "How can I escalate an urgent issue?",
      answer: "If you have an urgent issue that requires immediate attention, select 'Urgent' priority when submitting your ticket. For after-hours emergencies, you can also call our support hotline at +1-800-123-4567."
    },
    {
      question: "What are your support hours?",
      answer: "Our online support team is available 24/7. Phone support is available Monday through Friday from 8:00 AM to 8:00 PM IST, and weekends from 10:00 AM to 6:00 PM IST."
    }
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 pb-0">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">Support Center</h2>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <Link to="/help" className="text-blue-600 hover:text-blue-800 flex items-center gap-2 w-fit">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to Help Center
            </Link>
          </div>
          
          <Card className="mb-6">
            <CardContent className="p-6">
              <ContactMethods />
            </CardContent>
          </Card>
          
          <Tabs defaultValue="support-ticket" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="support-ticket">Create Support Ticket</TabsTrigger>
              <TabsTrigger value="my-tickets">My Tickets</TabsTrigger>
            </TabsList>
            
            <TabsContent value="support-ticket" className="tabs-content">
              <Card className="support-card">
                <CardHeader>
                  <CardTitle>Submit a Support Request</CardTitle>
                  <CardDescription>
                    Tell us about your issue and we'll help you resolve it as quickly as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent className="card-content">
                  {ticketCreated ? (
                    <div className="flex flex-col items-center py-6">
                      <div className="bg-green-100 p-5 rounded-full mb-4">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-600">
                          <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7.75 12L10.58 14.83L16.25 9.17004" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h3 className="text-2xl font-semibold mb-3">Ticket Created Successfully!</h3>
                      <p className="text-gray-600 mb-5 text-center max-w-md">
                        Your ticket has been submitted successfully. Our support team will review your issue and get back to you shortly.
                      </p>
                      <div className="bg-blue-50 px-6 py-4 rounded-lg mb-6 flex items-center gap-3">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600">
                          <path d="M15.73 2C14.14 2 13.5 2.7 13.5 4.36V10.5C13.5 11.38 13.97 11.99 14.76 12.17C14.93 12.21 15.1 12.28 15.24 12.38L19 15.25C19.15 15.37 19.34 15.44 19.54 15.44C20.21 15.44 20.75 14.78 20.75 13.95V5.03C20.75 3.05 20.05 2 17.83 2H15.73Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M13.5 8H17.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3.25 18V7C3.25 3 4.25 2 8.25 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M11 22H8C4 22 3 21 3 17V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div>
                          <span className="text-sm text-blue-700 block">Your ticket number</span>
                          <span className="text-xl font-bold text-blue-900">{ticketNumber}</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                        <Button 
                          variant="outline" 
                          onClick={resetTicketForm} 
                          className="px-6 flex-1"
                        >
                          Create Another Ticket
                        </Button>
                        <Button 
                          onClick={() => setSelectedTab("my-tickets")} 
                          className="px-6 flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          View My Tickets
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmitSupportTicket)} className="space-y-6 form-container">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input 
                            id="name" 
                            placeholder="Your name" 
                            {...register("name", { required: "Name is required" })}
                          />
                          {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="Your email address" 
                            {...register("email", { 
                              required: "Email is required", 
                              pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Invalid email address"
                              }
                            })}
                          />
                          {errors.email && (
                            <p className="text-sm text-red-500">{errors.email.message}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Select 
                            onValueChange={(value) => {
                              const event = { target: { value } };
                              register("category", { required: "Please select a category" }).onChange(event);
                            }}
                            defaultValue=""
                          >
                            <SelectTrigger id="category">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {supportCategories.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.category && (
                            <p className="text-sm text-red-500">{errors.category.message}</p>
                          )}
                          <input type="hidden" {...register("category", { required: "Please select a category" })} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="priority">Priority</Label>
                          <Select 
                            onValueChange={(value) => {
                              const event = { target: { value } };
                              register("priority", { required: "Please select a priority" }).onChange(event);
                            }}
                            defaultValue="high"
                          >
                            <SelectTrigger id="priority">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              {priorityLevels.map((priority) => (
                                <SelectItem key={priority.value} value={priority.value}>
                                  {priority.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.priority && (
                            <p className="text-sm text-red-500">{errors.priority.message}</p>
                          )}
                          <input type="hidden" {...register("priority", { required: "Please select a priority" })} />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="orderNumber">Order/Shipment Number (Optional)</Label>
                        <Input 
                          id="orderNumber" 
                          placeholder="If applicable" 
                          {...register("orderNumber")}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input 
                          id="subject" 
                          placeholder="Brief description of your issue" 
                          {...register("subject", { required: "Subject is required" })}
                        />
                        {errors.subject && (
                          <p className="text-sm text-red-500">{errors.subject.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <textarea 
                          id="message" 
                          rows={6} 
                          className="w-full p-3 border rounded-md" 
                          placeholder="Please provide details about your issue..." 
                          {...register("message", { required: "Message is required" })}
                        />
                        {errors.message && (
                          <p className="text-sm text-red-500">{errors.message.message}</p>
                        )}
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <Checkbox id="newsletter" {...register("newsletter")} />
                        <Label htmlFor="newsletter" className="text-sm font-normal">
                          Send me email updates about the status of my ticket
                        </Label>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full md:w-auto px-6" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Ticket"}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="my-tickets" className="tabs-content">
              <Card className="support-card">
                <CardHeader>
                  <CardTitle>My Support Tickets</CardTitle>
                  <CardDescription>
                    View and track your existing support tickets.
                  </CardDescription>
                </CardHeader>
                <CardContent className="card-content">
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-end gap-4">
                      <div className="flex-grow space-y-2">
                        <Label htmlFor="ticketSearch">Search by Ticket Number or Subject</Label>
                        <Input 
                          id="ticketSearch" 
                          placeholder="Enter ticket number or subject" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Button 
                        className="md:mb-0" 
                        onClick={() => setSearchQuery(document.getElementById('ticketSearch').value)}
                      >
                        Search
                      </Button>
                    </div>
                    
                    <div className="border rounded-md">
                      <div className="p-4 bg-gray-50 border-b">
                        <h3 className="font-semibold">Your Tickets</h3>
                      </div>
                      
                      <TicketList 
                        tickets={searchQuery ? 
                          tickets.filter(ticket => 
                            ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (ticket.subject && ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()))
                          ) : 
                          tickets
                        } 
                        isLoading={isLoading}
                        onSelectTicket={(ticketId) => {
                          // If needed, add logic to view ticket details
                          console.log("Selected ticket:", ticketId);
                        }}
                        newTicketNumber={ticketNumber}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Quick answers to common questions. If you can't find what you're looking for, please submit a ticket above.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FAQ faqs={faqs} />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default SupportPage;
