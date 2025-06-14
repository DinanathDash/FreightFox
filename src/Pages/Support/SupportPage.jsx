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
import TicketDetails from "../../Components/Support/TicketDetails";
import { Dialog, DialogContent } from "../../Components/ui/dialog";
import "./SupportPage.css";

function SupportPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTab, setSelectedTab] = useState("support-ticket");
  const [ticketCreated, setTicketCreated] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const { tickets, isLoading, addTicket, addReply, getTicketById } = useTickets();
  
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
      <div className="container mx-auto p-3 sm:p-6 pb-0">
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <Link to="/help" className="text-blue-600 hover:text-blue-800 flex items-center gap-2 w-fit text-sm sm:text-base">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-5 sm:h-5">
                <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to Help Center
            </Link>
          </div>
          
          <Card className="mb-4 sm:mb-6">
            <CardContent className="p-3 sm:p-4 md:p-6 -mt-3 -mb-3">
              <ContactMethods />
            </CardContent>
          </Card>
          
          <Tabs defaultValue="support-ticket" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 md:mb-8">
              <TabsTrigger value="support-ticket" className="text-xs sm:text-sm md:text-base">Create Support Ticket</TabsTrigger>
              <TabsTrigger value="my-tickets" className="text-xs sm:text-sm md:text-base">My Tickets</TabsTrigger>
            </TabsList>
            
            <TabsContent value="support-ticket" className="tabs-content">
              <Card className="support-card">
                <CardHeader className="px-4 py-3 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl md:text-2xl">Submit a Support Request</CardTitle>
                  <CardDescription className="text-sm">
                    Tell us about your issue and we'll help you resolve it as quickly as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent className="card-content px-4 pb-4 sm:px-6 sm:pb-6">
                  {ticketCreated ? (
                    <div className="flex flex-col items-center py-4 sm:py-6">
                      <div className="bg-green-100 p-3 sm:p-5 rounded-full mb-3 sm:mb-4">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-600 sm:w-12 sm:h-12">
                          <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7.75 12L10.58 14.83L16.25 9.17004" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 text-center">Ticket Created Successfully!</h3>
                      <p className="text-gray-600 mb-4 sm:mb-5 text-center max-w-md text-sm sm:text-base">
                        Your ticket has been submitted successfully. Our support team will review your issue and get back to you shortly.
                      </p>
                      <div className="bg-blue-50 px-4 sm:px-6 py-3 sm:py-4 rounded-lg mb-5 sm:mb-6 flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600 sm:w-6 sm:h-6">
                          <path d="M15.73 2C14.14 2 13.5 2.7 13.5 4.36V10.5C13.5 11.38 13.97 11.99 14.76 12.17C14.93 12.21 15.1 12.28 15.24 12.38L19 15.25C19.15 15.37 19.34 15.44 19.54 15.44C20.21 15.44 20.75 14.78 20.75 13.95V5.03C20.75 3.05 20.05 2 17.83 2H15.73Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M13.5 8H17.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3.25 18V7C3.25 3 4.25 2 8.25 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M11 22H8C4 22 3 21 3 17V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div>
                          <span className="text-xs sm:text-sm text-blue-700 block">Your ticket number</span>
                          <span className="text-base sm:text-xl font-bold text-blue-900">{ticketNumber}</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-md">
                        <Button 
                          variant="outline" 
                          onClick={resetTicketForm} 
                          className="px-4 sm:px-6 flex-1 text-sm"
                        >
                          Create Another Ticket
                        </Button>
                        <Button 
                          onClick={() => setSelectedTab("my-tickets")} 
                          className="px-4 sm:px-6 flex-1 bg-blue-600 hover:bg-blue-700 text-sm"
                        >
                          View My Tickets
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmitSupportTicket)} className="space-y-4 sm:space-y-6 form-container">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-1 sm:space-y-2">
                          <Label htmlFor="name" className="text-sm">Name</Label>
                          <Input 
                            id="name" 
                            placeholder="Your name" 
                            {...register("name", { required: "Name is required" })}
                          />
                          {errors.name && (
                            <p className="text-xs sm:text-sm text-red-500">{errors.name.message}</p>
                          )}
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          <Label htmlFor="email" className="text-sm">Email</Label>
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
                            <p className="text-xs sm:text-sm text-red-500">{errors.email.message}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-1 sm:space-y-2">
                          <Label htmlFor="category" className="text-sm">Category</Label>
                          <Select 
                            onValueChange={(value) => {
                              const event = { target: { value } };
                              register("category", { required: "Please select a category" }).onChange(event);
                            }}
                            defaultValue=""
                          >
                            <SelectTrigger id="category" className="text-sm">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {supportCategories.map((category) => (
                                <SelectItem key={category.value} value={category.value} className="text-sm">
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.category && (
                            <p className="text-xs sm:text-sm text-red-500">{errors.category.message}</p>
                          )}
                          <input type="hidden" {...register("category", { required: "Please select a category" })} />
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          <Label htmlFor="priority" className="text-sm">Priority</Label>
                          <Select 
                            onValueChange={(value) => {
                              const event = { target: { value } };
                              register("priority", { required: "Please select a priority" }).onChange(event);
                            }}
                            defaultValue="high"
                          >
                            <SelectTrigger id="priority" className="text-sm">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              {priorityLevels.map((priority) => (
                                <SelectItem key={priority.value} value={priority.value} className="text-sm">
                                  {priority.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.priority && (
                            <p className="text-xs sm:text-sm text-red-500">{errors.priority.message}</p>
                          )}
                          <input type="hidden" {...register("priority", { required: "Please select a priority" })} />
                        </div>
                      </div>
                      
                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="orderNumber" className="text-sm">Order/Shipment Number (Optional)</Label>
                        <Input 
                          id="orderNumber" 
                          placeholder="If applicable" 
                          {...register("orderNumber")}
                        />
                      </div>
                      
                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="subject" className="text-sm">Subject</Label>
                        <Input 
                          id="subject" 
                          placeholder="Brief description of your issue" 
                          {...register("subject", { required: "Subject is required" })}
                        />
                        {errors.subject && (
                          <p className="text-xs sm:text-sm text-red-500">{errors.subject.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-1 sm:space-y-2">
                        <Label htmlFor="message" className="text-sm">Message</Label>
                        <textarea 
                          id="message" 
                          rows={6} 
                          className="w-full p-2 sm:p-3 border rounded-md text-sm" 
                          placeholder="Please provide details about your issue..." 
                          {...register("message", { required: "Message is required" })}
                        />
                        {errors.message && (
                          <p className="text-xs sm:text-sm text-red-500">{errors.message.message}</p>
                        )}
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <Checkbox id="newsletter" {...register("newsletter")} />
                        <Label htmlFor="newsletter" className="text-xs sm:text-sm font-normal">
                          Send me email updates about the status of my ticket
                        </Label>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full sm:w-auto px-4 sm:px-6 text-sm" 
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
                <CardHeader className="px-4 py-3 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl md:text-2xl">My Support Tickets</CardTitle>
                  <CardDescription className="text-sm">
                    View and track your existing support tickets.
                  </CardDescription>
                </CardHeader>
                <CardContent className="card-content px-4 pb-4 sm:px-6 sm:pb-6">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
                      <div className="flex-grow space-y-1 sm:space-y-2">
                        <Label htmlFor="ticketSearch" className="text-sm">Search by Ticket Number or Subject</Label>
                        <Input 
                          id="ticketSearch" 
                          placeholder="Enter ticket number or subject" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <Button 
                        className="w-full sm:w-auto sm:mb-0 text-sm" 
                        onClick={() => setSearchQuery(document.getElementById('ticketSearch').value)}
                      >
                        Search
                      </Button>
                    </div>
                    
                    <div className="border rounded-md">
                      <div className="p-3 sm:p-4 bg-gray-50 border-b">
                        <h3 className="font-semibold text-sm sm:text-base">Your Tickets</h3>
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
                          setSelectedTicketId(ticketId);
                          setDetailsDialogOpen(true);
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
            <CardHeader className="px-4 py-3 sm:p-6">
              <CardTitle className="text-lg sm:text-xl md:text-2xl">Frequently Asked Questions</CardTitle>
              <CardDescription className="text-sm">
                Quick answers to common questions. If you can't find what you're looking for, please submit a ticket above.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
              <FAQ faqs={faqs} />
            </CardContent>
          </Card>
        </div>
        
        {/* Ticket Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[800px] max-h-[90vh] overflow-y-auto p-0" showCloseButton={false}>
            {selectedTicketId && (
              <TicketDetails 
                ticket={getTicketById(selectedTicketId)} 
                onClose={() => setDetailsDialogOpen(false)}
                inDialog={true}
                onAddReply={(ticketId, reply) => {
                  addReply(ticketId, reply);
                  toast.success("Reply sent successfully!");
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

export default SupportPage;
