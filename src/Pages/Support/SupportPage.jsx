import React, { useState, useEffect } from 'react';
import { useTickets } from '../../hooks/useTickets';
import { useAuth } from '../../Context/AuthContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../Components/ui/tabs';
import { Input } from '../../Components/ui/input';
import { Button } from '../../Components/ui/button';
import { Textarea } from '../../Components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../Components/ui/dialog';
import ContactMethods from '../../Components/Support/ContactMethods';
import LiveChat from '../../Components/Support/LiveChat';
import FAQ from '../../Components/Support/FAQ';
import TicketList from '../../Components/Support/TicketList';
import TicketDetails from '../../Components/Support/TicketDetails';
import { toast } from "sonner";
import DashboardLayout from '@/Components/Dashboard/DashboardLayout';

function SupportPage() {
    // States
    const [activeTab, setActiveTab] = useState('tickets');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
    const [isNewTicketDialogOpen, setIsNewTicketDialogOpen] = useState(false);
    const [newTicket, setNewTicket] = useState({
        subject: '',
        category: 'general',
        message: '',
        priority: 'normal'
    });
    const [newTicketNumber, setNewTicketNumber] = useState(null);
    const [isMobile, setIsMobile] = useState(false);

    // Hooks
    const { tickets, isLoading, addTicket, addReply, getTicketById } = useTickets();
    const { currentUser } = useAuth();

    // Check screen size for responsive adjustments
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => {
            window.removeEventListener('resize', checkScreenSize);
        };
    }, []);

    // Handler functions
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSelectTicket = (ticketId) => {
        const ticket = getTicketById(ticketId);
        if (ticket) {
            setSelectedTicket(ticket);
            setIsTicketDialogOpen(true);
        } else if (ticketId === newTicketNumber) {
            // Handle case for newly created ticket
            setSelectedTicket({
                id: newTicketNumber,
                subject: "Recently submitted ticket",
                message: "Your ticket has been submitted and is being processed. Our support team will respond shortly.",
                status: "pending",
                priority: "normal",
                createdAt: new Date(),
                userId: currentUser?.uid,
                userName: currentUser?.displayName || currentUser?.email
            });
            setIsTicketDialogOpen(true);
        }
    };

    const handleCreateTicket = async () => {
        // Validate form
        if (!newTicket.subject.trim()) {
            toast.error("Please enter a subject for your ticket");
            return;
        }

        if (!newTicket.message.trim()) {
            toast.error("Please enter a message for your ticket");
            return;
        }

        try {
            const createdTicket = await addTicket(newTicket);
            setNewTicketNumber(createdTicket.id);
            toast.success("Support ticket created successfully");
            setNewTicket({
                subject: '',
                category: 'general',
                message: '',
                priority: 'normal'
            });
            setIsNewTicketDialogOpen(false);
        } catch (error) {
            console.error("Error creating ticket:", error);
            toast.error("Failed to create support ticket. Please try again.");
        }
    };

    const handleAddReply = async (ticketId, reply) => {
        try {
            await addReply(ticketId, reply);
            // Update the selected ticket with the new reply
            const updatedTicket = getTicketById(ticketId);
            setSelectedTicket(updatedTicket);
            return true;
        } catch (error) {
            console.error("Error adding reply:", error);
            toast.error("Failed to send reply. Please try again.");
            return false;
        }
    };

    // Filter tickets based on search query
    const filteredTickets = tickets.filter(ticket =>
        ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // FAQs data
    const faqs = [
        {
            question: "How do I track my shipment?",
            answer: "You can track your shipment by entering your tracking number in the Shipment Tracker on the Dashboard. Alternatively, you can navigate to the Shipments section and find your shipment in the list."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards (Visa, Mastercard, American Express, RuPay), as well as digital payments through PayPal, Google Pay, Apple Pay, and bank transfers."
        },
        {
            question: "How do I cancel a shipment?",
            answer: "To cancel a shipment, go to the Shipments section, locate the shipment you want to cancel, and click on the 'Cancel' button. Note that cancellation is only possible if the shipment hasn't been picked up yet."
        },
        {
            question: "Do you offer international shipping?",
            answer: "Yes, we provide international shipping services to over 150 countries worldwide. Rates and delivery times vary based on destination, package dimensions, and weight."
        },
        {
            question: "What is your refund policy?",
            answer: "Refunds are processed within 5-7 business days after approval. The amount may take an additional 3-5 days to reflect in your account depending on your financial institution."
        },
        {
            question: "How can I get a shipping quote?",
            answer: "You can get a shipping quote by using the Price Calculator on the Shipment page. You'll need to provide the origin, destination, package dimensions, weight, and preferred delivery timeline."
        }
    ];

    return (
        <DashboardLayout>
            <div className="container mx-auto p-3 md:p-6 max-w-7xl space-y-6">
                <div className='space-y-4 md:space-y-6'>
                    <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">How Can We Help You?</h2>

                    <Card className="shadow-sm border-gray-200">
                        <CardContent className="pt-1 px-3 md:px-6">
                            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="w-full">
                                    <TabsTrigger value="tickets" className="text-xs sm:text-sm">My Support Tickets</TabsTrigger>
                                    <TabsTrigger value="faq" className="text-xs sm:text-sm">Frequently Asked Questions</TabsTrigger>
                                </TabsList>

                                {/* Tickets Tab */}
                                <TabsContent value="tickets" className="pt-4 outline-none focus:ring-0">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                                        <div className="relative w-full md:w-64 group">
                                            <Input
                                                type="text"
                                                placeholder="Search tickets..."
                                                value={searchQuery}
                                                onChange={handleSearchChange}
                                                className="pl-8 text-xs sm:text-sm w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-md"
                                            />
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                                                className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 group-hover:text-blue-500 transition-colors duration-200">
                                                <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <Button
                                            onClick={() => setIsNewTicketDialogOpen(true)}
                                            className="w-full md:w-auto text-xs sm:text-sm whitespace-nowrap bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium px-3 py-2 md:px-4 md:py-2 rounded-md shadow-sm hover:shadow transition-all duration-200"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                                                className="mr-1 md:mr-1.5 hidden sm:inline-block">
                                                <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            Create New Ticket
                                        </Button>
                                    </div>

                                    <div className="bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm">
                                        {!currentUser ? (
                                            <div className="p-4 md:p-5 text-center">
                                                <p className="text-gray-600 text-xs sm:text-sm md:text-base">Please sign in to view your support tickets.</p>
                                            </div>
                                        ) : (
                                            <TicketList
                                                tickets={filteredTickets}
                                                isLoading={isLoading}
                                                onSelectTicket={handleSelectTicket}
                                                newTicketNumber={newTicketNumber}
                                            />
                                        )}
                                    </div>
                                </TabsContent>

                                {/* FAQ Tab */}
                                <TabsContent value="faq" className="pt-4 outline-none focus:ring-0">
                                    <FAQ faqs={faqs} />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                <div className='space-y-4 md:space-y-6'>
                    <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">Contact us</h2>
                    <Card className='p-4 md:p-6'>
                        <ContactMethods />
                    </Card>
                </div>

                {/* Ticket Details Dialog */}
                <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
                    <DialogContent className="max-w-[90vw] md:max-w-[800px] p-0 rounded-xl overflow-hidden shadow border border-gray-100 w-[90vw]">
                        {selectedTicket && (
                            <TicketDetails
                                ticket={selectedTicket}
                                onClose={() => setIsTicketDialogOpen(false)}
                                onAddReply={handleAddReply}
                            />
                        )}
                    </DialogContent>
                </Dialog>

                {/* New Ticket Dialog */}
                <Dialog open={isNewTicketDialogOpen} onOpenChange={setIsNewTicketDialogOpen}>
                    <DialogContent className="max-w-[600px] rounded-xl overflow-visible shadow border border-gray-100">
                        <DialogHeader className="space-y-1">
                            <DialogTitle className="text-lg font-semibold text-gray-800">Create New Support Ticket</DialogTitle>
                            <DialogDescription className="text-gray-600 text-sm">
                                Fill out the form below to submit a new support ticket.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <label htmlFor="subject" className="text-sm font-medium text-gray-700">Subject</label>
                                <Input
                                    id="subject"
                                    value={newTicket.subject}
                                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                    placeholder="Brief description of your issue"
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="category" className="text-sm font-medium text-gray-700">Category</label>
                                <select
                                    id="category"
                                    value={newTicket.category}
                                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-10"
                                >
                                    <option value="general">General Inquiry</option>
                                    <option value="shipping">Shipping & Delivery</option>
                                    <option value="payment">Payment & Billing</option>
                                    <option value="technical">Technical Issue</option>
                                    <option value="account">Account Management</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="priority" className="text-sm font-medium text-gray-700">Priority</label>
                                <select
                                    id="priority"
                                    value={newTicket.priority}
                                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-10"
                                >
                                    <option value="low">Low</option>
                                    <option value="normal">Normal</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-medium text-gray-700">Message</label>
                                <Textarea
                                    id="message"
                                    value={newTicket.message}
                                    onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                                    placeholder="Please describe your issue in detail..."
                                    className="min-h-[120px] resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setIsNewTicketDialogOpen(false)}
                                className="rounded-md border border-gray-300 bg-white text-gray-700"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateTicket}
                                className="rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Submit Ticket
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}

export default SupportPage;
