import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../Components/ui/button';
import { Card } from '../../Components/ui/card';
import { AlertCircle, Home, ArrowLeft, RefreshCw, Terminal } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../Components/ui/tabs';

const ErrorPage = ({ statusCode = 404, message }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [consoleErrors, setConsoleErrors] = useState([]);
    const [countdown, setCountdown] = useState(10);

    // Get error details from location state if available
    const errorState = location.state || {};
    const errorMessage = message || errorState.message;

    // Hide LiveChat on error pages
    useEffect(() => {
        // Set a flag in sessionStorage to indicate we're on an error page
        sessionStorage.setItem('freightfox_on_error_page', 'true');

        // Add a style tag to hide the LiveChat component using specific selectors
        const style = document.createElement('style');
        style.id = 'hide-livechat-style';
        style.textContent = `
      /* Hide LiveChat components */
      .fixed.bottom-25.md\\:bottom-6.right-6.z-50, 
      .fixed.bottom-45.md\\:bottom-24.right-3.md\\:right-6.z-50 { 
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
      }
    `;
        document.head.appendChild(style);

        // Backup: Attempt to find and hide elements after the component mounts
        const hideElements = () => {
            // Find LiveChat elements by their positional classes
            const chatButtons = document.querySelectorAll('.fixed.bottom-25, .fixed.bottom-45, .fixed.right-6');
            chatButtons.forEach(el => {
                if (el.classList.contains('z-50')) {
                    el.style.display = 'none';
                }
            });
        };

        // Run immediately and after a short delay to ensure it catches any late-rendered components
        hideElements();
        const timerId = setTimeout(hideElements, 500);

        // Clean up when component unmounts
        return () => {
            sessionStorage.removeItem('freightfox_on_error_page');
            if (document.getElementById('hide-livechat-style')) {
                document.head.removeChild(document.getElementById('hide-livechat-style'));
            }
            clearTimeout(timerId);
        };
    }, []);

    // Dispatch custom event to hide LiveChat
    useEffect(() => {
        // Create and dispatch a custom event that LiveChat can listen for
        const hideLiveChatEvent = new CustomEvent('hideLiveChat', {
            detail: { shouldHide: true, path: window.location.pathname }
        });
        window.dispatchEvent(hideLiveChatEvent);

        // Restore LiveChat when leaving the error page
        return () => {
            const showLiveChatEvent = new CustomEvent('hideLiveChat', {
                detail: { shouldHide: false, path: null }
            });
            window.dispatchEvent(showLiveChatEvent);
        };
    }, []);

    // Container animation
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.3,
                staggerChildren: 0.2
            }
        }
    };

    // Child animation
    const childVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 120 }
        }
    };

    // Number animation with pulse effect
    const numberVariants = {
        hidden: { scale: 0.8, opacity: 0, rotateY: 90 },
        visible: {
            scale: 1,
            opacity: 1,
            rotateY: 0,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 10
            }
        }
    };

    // Floating animation for continuous movement
    const floatingAnimation = {
        y: [0, -10, 0],
        transition: {
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
        }
    };

    // Button hover animation
    const buttonHoverAnimation = {
        scale: 1.05,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 10
        }
    };

    // Background animation with more complex movement
    const backgroundVariants = {
        initial: {
            backgroundPosition: "0% 0%, 0% 0%, 0% 0%"
        },
        animate: {
            backgroundPosition: "100% 100%, 100% 0%, 0% 100%",
            transition: {
                duration: 30,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "mirror"
            }
        }
    };

    // Capture console errors
    useEffect(() => {
        // Get any existing errors from the console
        const existingErrors = [];

        // Override console.error to capture errors
        const originalConsoleError = console.error;
        console.error = (...args) => {
            // Skip errors coming from the error page itself to avoid loops
            const errorString = args.join(' ');
            if (errorString.includes('ErrorPage') || errorString.includes('Error captured:')) {
                originalConsoleError.apply(console, args);
                return;
            }

            try {
                // Safely convert arguments to strings
                const errorMessage = args.map(arg => {
                    if (arg === null) return 'null';
                    if (arg === undefined) return 'undefined';
                    if (typeof arg !== 'object') return String(arg);

                    try {
                        return JSON.stringify(arg, null, 2);
                    } catch (e) {
                        return '[Object cannot be stringified]';
                    }
                }).join(' ');

                existingErrors.push({
                    timestamp: new Date().toISOString(),
                    message: errorMessage
                });

                setConsoleErrors([...existingErrors]);
            } catch (e) {
                // If anything goes wrong with our error handling, just continue
            }

            originalConsoleError.apply(console, args);
        };

        // Restore original console.error when component unmounts
        return () => {
            console.error = originalConsoleError;
        };
    }, []);

    // Auto-redirect countdown
      useEffect(() => {
        if (countdown <= 0) {
          navigate('/');
          return;
        }

        const timer = setTimeout(() => {
          setCountdown(countdown - 1);
        }, 1000);

        return () => clearTimeout(timer);
      }, [countdown, navigate]);

    return (
        <motion.div
            className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative"
            initial="initial"
            animate="animate"
            variants={backgroundVariants}
            style={{
                background: "radial-gradient(circle at 50% 50%, rgba(var(--background), 0.9), rgba(var(--muted), 0.5)), radial-gradient(circle at 10% 90%, rgba(var(--primary), 0.05), transparent 40%), radial-gradient(circle at 90% 10%, rgba(var(--secondary), 0.05), transparent 40%)",
                backgroundSize: "200% 200%, 50% 50%, 50% 50%"
            }}
        >
            {/* Floating particles for subtle motion */}
            {[...Array(12)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-primary/10"
                    style={{
                        width: Math.random() * 8 + 3 + 'px',
                        height: Math.random() * 8 + 3 + 'px',
                        left: Math.random() * 100 + '%',
                        top: Math.random() * 100 + '%',
                    }}
                    animate={{
                        x: [
                            0,
                            Math.random() * 100 - 50,
                            Math.random() * -100 + 50,
                            0
                        ],
                        y: [
                            0,
                            Math.random() * 100 - 50,
                            Math.random() * -100 + 50,
                            0
                        ],
                        opacity: [0.1, 0.3, 0.1],
                        scale: [1, Math.random() * 1.5 + 0.5, 1],
                    }}
                    transition={{
                        duration: Math.random() * 20 + 10,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                        delay: Math.random() * 5,
                    }}
                />
            ))}

            <motion.div
                className="w-full mx-auto flex justify-center items-center relative z-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Animated background shapes - more shapes with varied movements */}
                {/* Top right circle */}
                <motion.div
                    className="absolute -z-10 top-0 right-0 w-64 h-64 rounded-full bg-primary/5"
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, -50, 0],
                        y: [0, -30, 0],
                        rotate: [0, 15, 0]
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        repeatType: "reverse"
                    }}
                />

                {/* Bottom left circle */}
                <motion.div
                    className="absolute -z-10 bottom-0 left-0 w-40 h-40 rounded-full bg-secondary/5"
                    animate={{
                        scale: [1, 1.1, 1],
                        x: [0, 40, 0],
                        y: [0, 30, 0],
                        rotate: [0, -10, 0]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: 1
                    }}
                />

                {/* Top left square with rotation */}
                <motion.div
                    className="absolute -z-10 top-20 left-0 w-32 h-32 rounded-xl bg-primary/3"
                    animate={{
                        scale: [0.9, 1.1, 0.9],
                        x: [0, 30, 0],
                        y: [0, 40, 0],
                        rotate: [0, 45, 0]
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: 0.5
                    }}
                />

                {/* Bottom right diamond shape */}
                <motion.div
                    className="absolute -z-10 bottom-20 right-20 w-36 h-36 rounded-xl bg-secondary/3"
                    style={{ transform: "rotate(45deg)" }}
                    animate={{
                        scale: [1, 0.8, 1],
                        x: [0, -40, 0],
                        y: [0, -30, 0],
                        rotate: [45, 90, 45]
                    }}
                    transition={{
                        duration: 9,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: 2
                    }}
                />

                {/* Middle horizontal movement */}
                <motion.div
                    className="absolute -z-10 top-1/2 left-1/2 w-24 h-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/4"
                    animate={{
                        scale: [0.8, 1.2, 0.8],
                        x: [-50, 50, -50],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                />

                {/* Diagonal movement element */}
                <motion.div
                    className="absolute -z-10 bottom-40 left-20 w-20 h-20 rounded-md bg-primary/3"
                    animate={{
                        x: [0, 80, 0],
                        y: [0, -80, 0],
                        rotate: [0, 180, 360],
                        opacity: [0.2, 0.5, 0.2]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        repeatType: "mirror",
                        ease: "linear"
                    }}
                />

                <Card className="shadow-lg overflow-hidden backdrop-blur-sm bg-background/80 max-w-2xl mx-auto">
                    <motion.div
                        className="flex flex-col items-center text-center p-6 md:p-8"
                        variants={childVariants}
                    >
                        <motion.div
                            className="mb-6"
                            animate={floatingAnimation}
                            whileHover={{ scale: 1.1, rotate: [0, -5, 5, -5, 0] }}
                        >
                            <motion.img
                                src="/src/assets/Logo.svg"
                                alt="FreightFox Logo"
                                className="h-12 md:h-16 drop-shadow-lg"
                                initial={{ opacity: 0, y: -50, rotateY: 90 }}
                                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 100,
                                    delay: 0.2,
                                    duration: 0.8
                                }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    // Try different paths if the initial one fails
                                    if (e.target.src.includes('/src/assets/Logo.svg')) {
                                        e.target.src = "/assets/Logo.svg";
                                    } else if (e.target.src.includes('/assets/Logo.svg')) {
                                        e.target.src = "/vite.svg";
                                    }
                                }}
                            />
                        </motion.div>

                        <motion.div
                            variants={numberVariants}
                            className="mb-4 relative"
                            whileHover={{ scale: 1.1 }}
                        >
                            <motion.div
                                className="absolute inset-0 text-7xl md:text-9xl font-extrabold text-primary/30 blur-lg"
                                animate={{
                                    scale: [1, 1.05, 1],
                                    opacity: [0.5, 0.8, 0.5]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatType: "reverse"
                                }}
                            >
                                {statusCode}
                            </motion.div>
                            <div className="text-7xl md:text-9xl font-extrabold text-primary relative">
                                {statusCode}
                            </div>
                        </motion.div>

                        <motion.h2 variants={childVariants} className="text-2xl md:text-3xl font-bold mb-2">
                            {statusCode === 404 ? "Page Not Found" : "Something went wrong"}
                        </motion.h2>

                        <motion.p variants={childVariants} className="text-muted-foreground mb-6 max-w-md">
                            {errorMessage || (statusCode === 404
                                ? "The page you're looking for doesn't exist or has been moved."
                                : "An unexpected error occurred while processing your request.")}
                        </motion.p>

                        <motion.div
                            variants={childVariants}
                            className="flex flex-col sm:flex-row gap-3 w-full justify-center"
                        >
                            <motion.div whileHover={buttonHoverAnimation} whileTap={{ scale: 0.95 }}>
                                <Button
                                    onClick={() => navigate(-1)}
                                    variant="outline"
                                    className="gap-2 relative overflow-hidden group"
                                >
                                    <motion.span
                                        className="absolute inset-0 bg-primary/10"
                                        initial={{ x: "-100%" }}
                                        whileHover={{ x: "100%" }}
                                        transition={{ duration: 0.5 }}
                                    />
                                    <ArrowLeft size={16} className="group-hover:animate-bounce-x" /> Go Back
                                </Button>
                            </motion.div>

                            <motion.div whileHover={buttonHoverAnimation} whileTap={{ scale: 0.95 }}>
                                <Button
                                    onClick={() => navigate('/')}
                                    className="gap-2 relative overflow-hidden group"
                                >
                                    <motion.span
                                        className="absolute inset-0 bg-white/10"
                                        initial={{ x: "-100%" }}
                                        whileHover={{ x: "100%" }}
                                        transition={{ duration: 0.5 }}
                                    />
                                    <Home size={16} className="group-hover:animate-bounce" /> Go Home
                                </Button>
                            </motion.div>

                            <motion.div whileHover={buttonHoverAnimation} whileTap={{ scale: 0.95 }}>
                                <Button
                                    onClick={() => window.location.reload()}
                                    variant="secondary"
                                    className="gap-2 relative overflow-hidden group"
                                >
                                    <motion.span
                                        className="absolute inset-0 bg-secondary/10"
                                        initial={{ x: "-100%" }}
                                        whileHover={{ x: "100%" }}
                                        transition={{ duration: 0.5 }}
                                    />
                                    <RefreshCw size={16} className="group-hover:animate-spin" /> Reload Page
                                </Button>
                            </motion.div>
                        </motion.div>

                        <motion.p
                            variants={childVariants}
                            className="text-sm text-muted-foreground mt-6 relative"
                        >
                            <motion.span
                                className="absolute inset-0"
                                animate={{
                                    opacity: [1, 0.6, 1],
                                    scale: [1, 1.05, 1]
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    repeatType: "reverse"
                                }}
                            />
                            Redirecting to home in {countdown} seconds...
                        </motion.p>
                    </motion.div>

                    {/* Developer section with console errors */}
                    <motion.div
                        variants={childVariants}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.5 }}
                        className="border-t relative"
                    >
                        <motion.div
                            className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-background px-4 text-xs text-muted-foreground"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2 }}
                        >
                            Developer Information
                        </motion.div>

                        <Tabs defaultValue="errors" className="w-full">
                            <div className="px-4">
                                <TabsList className="grid grid-cols-2 w-full my-4">
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <TabsTrigger value="errors" className="flex items-center gap-2 w-full group">
                                            <motion.span
                                                animate={{
                                                    rotate: statusCode === 500 ? [0, 15, -15, 0] : 0
                                                }}
                                                transition={{
                                                    duration: 0.5,
                                                    repeat: statusCode === 500 ? Infinity : 0,
                                                    repeatDelay: 4
                                                }}
                                            >
                                                <AlertCircle size={16} className="group-hover:text-destructive" />
                                            </motion.span>
                                            Error Details
                                        </TabsTrigger>
                                    </motion.div>

                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <TabsTrigger value="console" className="flex items-center gap-2 w-full group">
                                            <motion.span
                                                animate={{
                                                    y: consoleErrors.length > 0 ? [0, -2, 0] : 0
                                                }}
                                                transition={{
                                                    duration: 0.3,
                                                    repeat: consoleErrors.length > 0 ? Infinity : 0,
                                                    repeatDelay: 2
                                                }}
                                            >
                                                <Terminal size={16} className="group-hover:text-primary" />
                                            </motion.span>
                                            Console Output
                                        </TabsTrigger>
                                    </motion.div>
                                </TabsList>
                            </div>

                            <TabsContent value="errors" className="px-6 pb-6">
                                <motion.div
                                    className="bg-muted p-4 rounded-md text-left relative overflow-hidden"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <motion.div
                                        className="absolute top-0 left-0 w-1 h-full bg-destructive"
                                        initial={{ scaleY: 0 }}
                                        animate={{ scaleY: 1 }}
                                        transition={{ delay: 0.4, duration: 0.5 }}
                                    />

                                    <motion.p
                                        className="font-mono text-sm mb-2"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        Error Type: {statusCode === 404 ? "Not Found" : "Application Error"}
                                    </motion.p>

                                    <motion.p
                                        className="font-mono text-sm mb-2"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.7 }}
                                    >
                                        Path: {window.location.pathname}
                                    </motion.p>

                                    <motion.p
                                        className="font-mono text-sm"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.8 }}
                                    >
                                        Time: {new Date().toLocaleTimeString()}
                                    </motion.p>
                                </motion.div>
                            </TabsContent>

                            <TabsContent value="console" className="px-6 pb-6">
                                <motion.div
                                    className="bg-muted p-4 rounded-md max-h-60 overflow-y-auto text-left"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {consoleErrors.length > 0 ? (
                                        <motion.ul
                                            className="space-y-2"
                                            initial="hidden"
                                            animate="visible"
                                            variants={{
                                                visible: {
                                                    transition: {
                                                        staggerChildren: 0.1
                                                    }
                                                }
                                            }}
                                        >
                                            {consoleErrors.map((error, index) => (
                                                <motion.li
                                                    key={index}
                                                    className="font-mono text-xs border-l-2 border-destructive pl-2"
                                                    variants={{
                                                        hidden: { opacity: 0, x: -5 },
                                                        visible: { opacity: 1, x: 0 }
                                                    }}
                                                >
                                                    <div className="text-xs text-muted-foreground">{new Date(error.timestamp).toLocaleTimeString()}</div>
                                                    <pre className="whitespace-pre-wrap break-words">{error.message}</pre>
                                                </motion.li>
                                            ))}
                                        </motion.ul>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <motion.p
                                                className="text-muted-foreground text-sm flex items-center gap-2"
                                                animate={{
                                                    color: ["hsl(var(--muted-foreground))", "hsl(var(--primary))", "hsl(var(--muted-foreground))"]
                                                }}
                                                transition={{ duration: 3, repeat: Infinity }}
                                            >
                                                <motion.span
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                >
                                                    <RefreshCw size={14} />
                                                </motion.span>
                                                No console errors detected
                                            </motion.p>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </TabsContent>
                        </Tabs>
                    </motion.div>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default ErrorPage;
