"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
	motion,
	useScroll,
	useTransform,
	AnimatePresence,
} from "framer-motion";
import {
	GraduationCap,
	Clock,
	CreditCard,
	ArrowRight,
	Facebook,
	Twitter,
	Instagram,
	Linkedin,
	Bell,
	FileText,
	Users,
	Mail,
	Phone,
	MapPin,
	Menu,
	X,
	Sun,
	Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

// Fix the image loading issue by using placeholder images instead of external URLs
const ImageCarousel = () => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const images = [
		"/bg.jpg",
		"/dm.jpg",
		"/gm.jpg",
		"/st.jpg",
		"/st1.jpg",
		"/st3.jpg",
		"/stud.jpg",
		"/gcjpg.jpg",
	];

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
		}, 5000);

		return () => clearInterval(interval);
	}, [images.length]);

	return (
		<div className="relative w-full h-full overflow-hidden">
			{images.map((image, index) => (
				<motion.div
					key={image}
					className="absolute inset-0 w-full h-full"
					initial={{ opacity: 0, rotateY: 90, scale: 0.8 }}
					animate={{
						opacity: index === currentIndex ? 1 : 0,
						rotateY: index === currentIndex ? 0 : 90,
						scale: index === currentIndex ? 1 : 0.8,
						zIndex: index === currentIndex ? 10 : 0,
					}}
					transition={{ duration: 1.2, ease: "easeInOut" }}
				>
					<div className="relative w-full h-full">
						<Image
							src={image || "/placeholder.svg"}
							alt={`Campus view ${index + 1}`}
							fill
							className="object-cover"
							priority={index === 0}
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
					</div>
				</motion.div>
			))}

			{/* Indicators */}
			<div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
				{images.map((_, index) => (
					<button
						key={index}
						className={`w-3 h-3 rounded-full transition-all duration-300 ${
							index === currentIndex ? "bg-white scale-125" : "bg-white/50"
						}`}
						onClick={() => setCurrentIndex(index)}
					/>
				))}
			</div>
		</div>
	);
};

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => (
	<motion.div
		initial={{ opacity: 0, y: 50 }}
		whileInView={{ opacity: 1, y: 0 }}
		viewport={{ once: true }}
		transition={{ duration: 0.6, delay }}
		whileHover={{
			y: -10,
			boxShadow:
				"0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
		}}
		className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
	>
		<div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
			<Icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
		</div>
		<h3 className="text-xl font-bold mb-3">{title}</h3>
		<p className="text-gray-600 dark:text-gray-300">{description}</p>
	</motion.div>
);

// Process Step Component
const ProcessStep = ({ number, title, description, delay = 0 }) => (
	<motion.div
		initial={{ opacity: 0, x: -50 }}
		whileInView={{ opacity: 1, x: 0 }}
		viewport={{ once: true }}
		transition={{ duration: 0.6, delay }}
		className="relative"
	>
		<div className="flex items-start gap-4">
			<div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
				{number}
			</div>
			<div>
				<h3 className="text-xl font-bold mb-2">{title}</h3>
				<p className="text-gray-600 dark:text-gray-300">{description}</p>
			</div>
		</div>
		{number < 5 && (
			<div className="absolute left-6 top-12 w-0.5 h-16 bg-blue-200 dark:bg-blue-800 ml-[0.3rem]"></div>
		)}
	</motion.div>
);

// FAQ Item Component
const faqItems = [
	{
		question: "How do I start a clearance request?",
		answer:
			"Log in to the Digital Clearance System, navigate to your dashboard, and click on 'New Request'. Select the type of clearance you need and follow the guided process to submit your request.",
	},
	{
		question: "How long does the clearance process take?",
		answer:
			"The clearance process typically takes 3-5 business days, depending on the type of clearance and the number of departments that need to approve your request.",
	},
	{
		question: "Can I track the status of my clearance request?",
		answer:
			"Yes, you can track the status of your clearance request in real-time through your dashboard. You'll see which departments have approved your request and which ones are still pending.",
	},
	{
		question: "What should I do if my request is rejected?",
		answer:
			"If your request is rejected, you'll receive a notification with the reason for rejection. You can address the issues mentioned and resubmit your request through the system.",
	},
	{
		question: "How do I request an ID card replacement?",
		answer:
			"To request an ID card replacement, log in to the system, select 'ID Replacement' from the request types, provide the reason for replacement, and submit any required documentation.",
	},
];

// Add dark mode support to the landing page
export default function Home() {
	const { scrollY } = useScroll();
	const heroRef = useRef(null);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [activeSection, setActiveSection] = useState("home");
	const [darkMode, setDarkMode] = useState(false);

	// Parallax effects
	const y = useTransform(scrollY, [0, 1000], [0, 300]);
	const opacity = useTransform(scrollY, [0, 300], [1, 0]);
	const scale = useTransform(scrollY, [0, 300], [1, 0.8]);

	// Refs for scroll sections
	const featuresRef = useRef(null);
	const howItWorksRef = useRef(null);
	const faqRef = useRef(null);

	// Check for dark mode preference
	useEffect(() => {
		const isDark = localStorage.getItem("darkMode") === "true";
		setDarkMode(isDark);

		if (isDark) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	}, []);

	const toggleDarkMode = () => {
		const newMode = !darkMode;
		setDarkMode(newMode);
		localStorage.setItem("darkMode", newMode.toString());

		if (newMode) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	};

	// Handle navigation click
	const scrollToSection = (sectionRef) => {
		if (sectionRef.current) {
			sectionRef.current.scrollIntoView({ behavior: "smooth" });
		}
		setMobileMenuOpen(false);
	};

	// Update active section based on scroll position
	useEffect(() => {
		const handleScroll = () => {
			const scrollPosition = window.scrollY + 100;

			if (featuresRef.current && howItWorksRef.current && faqRef.current) {
				const featuresTop = featuresRef.current.offsetTop;
				const howItWorksTop = howItWorksRef.current.offsetTop;
				const faqTop = faqRef.current.offsetTop;

				if (scrollPosition < featuresTop) {
					setActiveSection("home");
				} else if (
					scrollPosition >= featuresTop &&
					scrollPosition < howItWorksTop
				) {
					setActiveSection("features");
				} else if (scrollPosition >= howItWorksTop && scrollPosition < faqTop) {
					setActiveSection("howItWorks");
				} else {
					setActiveSection("faq");
				}
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<div className={`min-h-screen overflow-x-hidden ${darkMode ? "dark" : ""}`}>
			{/* Navigation */}
			<nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Image
								src="/logo_dmu.jpg"
								className="rounded-full"
								alt="University Logo"
								width={40}
								height={40}
							/>
							<span className="text-xl font-bold text-gray-900 dark:text-white">
								DCS
							</span>
						</div>

						{/* Desktop Navigation */}
						<div className="hidden md:flex items-center gap-6">
							<button
								onClick={() => scrollToSection(heroRef)}
								className={`text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors ${
									activeSection === "home"
										? "text-blue-600 dark:text-blue-400 font-medium"
										: ""
								}`}
							>
								Home
							</button>
							<button
								onClick={() => scrollToSection(featuresRef)}
								className={`text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors ${
									activeSection === "features"
										? "text-blue-600 dark:text-blue-400 font-medium"
										: ""
								}`}
							>
								Features
							</button>
							<button
								onClick={() => scrollToSection(howItWorksRef)}
								className={`text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors ${
									activeSection === "howItWorks"
										? "text-blue-600 dark:text-blue-400 font-medium"
										: ""
								}`}
							>
								How It Works
							</button>
							<button
								onClick={() => scrollToSection(faqRef)}
								className={`text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors ${
									activeSection === "faq"
										? "text-blue-600 dark:text-blue-400 font-medium"
										: ""
								}`}
							>
								FAQ
							</button>
							<Button asChild>
								<Link href="/login">Login</Link>
							</Button>
							<Button variant="outline" size="icon" onClick={toggleDarkMode}>
								{darkMode ? (
									<Sun className="h-5 w-5" />
								) : (
									<Moon className="h-5 w-5" />
								)}
							</Button>
						</div>

						{/* Mobile Menu Button */}
						<div className="md:hidden flex items-center gap-2">
							<Button variant="outline" size="icon" onClick={toggleDarkMode}>
								{darkMode ? (
									<Sun className="h-5 w-5" />
								) : (
									<Moon className="h-5 w-5" />
								)}
							</Button>
							<button
								className="p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
								onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							>
								{mobileMenuOpen ? (
									<X className="h-6 w-6" />
								) : (
									<Menu className="h-6 w-6" />
								)}
							</button>
						</div>
					</div>
				</div>

				{/* Mobile Menu */}
				<AnimatePresence>
					{mobileMenuOpen && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800"
						>
							<div className="container mx-auto px-4 py-4 space-y-4">
								<button
									onClick={() => scrollToSection(heroRef)}
									className="block w-full text-left py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
								>
									Home
								</button>
								<button
									onClick={() => scrollToSection(featuresRef)}
									className="block w-full text-left py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
								>
									Features
								</button>
								<button
									onClick={() => scrollToSection(howItWorksRef)}
									className="block w-full text-left py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
								>
									How It Works
								</button>
								<button
									onClick={() => scrollToSection(faqRef)}
									className="block w-full text-left py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
								>
									FAQ
								</button>
								<Button asChild className="w-full">
									<Link href="/login">Login</Link>
								</Button>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</nav>

			{/* Hero Section */}
			<motion.div
				ref={heroRef}
				className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
				style={{ y, scale }}
			>
				{/* 3D Image Carousel Background */}
				<div className="absolute inset-0 z-0">
					<ImageCarousel />
				</div>

				{/* Hero Content */}
				<div className="container mx-auto px-4 z-20 relative">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="text-center text-white max-w-3xl mx-auto"
					>
						<h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
							University Clearance System
						</h1>
						<p className="text-xl md:text-2xl mb-8 text-gray-100 drop-shadow-md">
							Go Digital. Get Cleared.
						</p>
						<p className="text-lg mb-10 text-gray-200 drop-shadow-sm">
							Manage clearance requests, track approvals, and streamline your
							process with ease.
						</p>
						<Button
							size="lg"
							asChild
							className="rounded-full text-lg px-8 py-6 hover:scale-105 transition-transform"
						>
							<Link href="/login">
								Get Started
								<ArrowRight className="ml-2" />
							</Link>
						</Button>
					</motion.div>
				</div>

				{/* Scroll Indicator */}
				<motion.div
					className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
					animate={{ y: [0, 10, 0] }}
					transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
				>
					<div className="w-8 h-12 rounded-full border-2 border-white/50 flex items-center justify-center">
						<div className="w-2 h-2 rounded-full bg-white animate-bounce"></div>
					</div>
				</motion.div>
			</motion.div>

			{/* Features Section */}
			<section ref={featuresRef} className="py-20 bg-gray-50 dark:bg-gray-900">
				<div className="container mx-auto px-4">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
						className="text-center mb-16"
					>
						<h2 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
							Powerful Features
						</h2>
						<p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
							Our digital clearance system offers a range of features to make
							your clearance process smooth and efficient.
						</p>
					</motion.div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						<FeatureCard
							icon={FileText}
							title="Request Clearance"
							description="Submit clearance requests digitally with just a few clicks. No more paperwork or long queues."
							delay={0.1}
						/>
						<FeatureCard
							icon={Clock}
							title="Track Approvals"
							description="Monitor your clearance status in real-time with our intuitive tracking system."
							delay={0.2}
						/>
						<FeatureCard
							icon={CreditCard}
							title="ID Card Replacement"
							description="Easy and quick process for replacing lost or damaged ID cards."
							delay={0.3}
						/>
						<FeatureCard
							icon={Bell}
							title="Notifications & Alerts"
							description="Get instant notifications about your clearance status and updates."
							delay={0.4}
						/>
						<FeatureCard
							icon={GraduationCap}
							title="Document Submission"
							description="Upload and manage all your required documents in one secure place."
							delay={0.5}
						/>
						<FeatureCard
							icon={Users}
							title="Admin Dashboard"
							description="Powerful tools for administrators to manage and process clearance requests efficiently."
							delay={0.6}
						/>
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<section ref={howItWorksRef} className="py-20 bg-white dark:bg-gray-800">
				<div className="container mx-auto px-4">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="text-center mb-16"
					>
						<h2 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
							How It Works
						</h2>
						<p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
							Complete your clearance in five simple steps
						</p>
					</motion.div>

					<div className="max-w-3xl mx-auto space-y-12">
						<ProcessStep
							number="1"
							title="Login to the System"
							description="Access the system using your university credentials securely."
							delay={0.1}
						/>
						<ProcessStep
							number="2"
							title="Submit Your Request"
							description="Choose the type of clearance you need and submit required documents."
							delay={0.2}
						/>
						<ProcessStep
							number="3"
							title="Approval Process"
							description="Your request is automatically routed to the relevant departments for approval."
							delay={0.3}
						/>
						<ProcessStep
							number="4"
							title="Track Progress"
							description="Monitor your request as it moves through different departments in real-time."
							delay={0.4}
						/>
						<ProcessStep
							number="5"
							title="Receive Approval"
							description="Get your digital clearance certificate once approved by all departments."
							delay={0.5}
						/>
					</div>
				</div>
			</section>

			{/* FAQ Section */}
			<section ref={faqRef} className="py-20 bg-gray-50 dark:bg-gray-900">
				<div className="container mx-auto px-4">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
						className="text-center mb-16"
					>
						<h2 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
							Frequently Asked Questions
						</h2>
						<p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
							Find answers to common questions about the clearance process
						</p>
					</motion.div>

					<div className="max-w-3xl mx-auto">
						<Accordion type="single" collapsible className="space-y-4">
							{faqItems.map((item, index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.4, delay: index * 0.1 }}
								>
									<AccordionItem
										value={`item-${index}`}
										className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm"
									>
										<AccordionTrigger className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
											{item.question}
										</AccordionTrigger>
										<AccordionContent className="px-6 pb-4 pt-2 text-gray-600 dark:text-gray-300">
											{item.answer}
										</AccordionContent>
									</AccordionItem>
								</motion.div>
							))}
						</Accordion>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
				<div className="container mx-auto px-4">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
						className="text-center text-white"
					>
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							Ready to Get Started?
						</h2>
						<p className="text-xl mb-8">
							Join thousands of students using our digital clearance system
						</p>
						<Button
							size="lg"
							variant="secondary"
							asChild
							className="rounded-full text-lg px-8 py-6 hover:scale-105 transition-transform"
						>
							<Link href="/login">
								Login Now
								<ArrowRight className="ml-2" />
							</Link>
						</Button>
					</motion.div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-gray-900 text-gray-300 py-12">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
						<div>
							<h3 className="text-white text-lg font-semibold mb-4">
								About DCS
							</h3>
							<p className="text-sm">
								The Digital Clearance System streamlines the university
								clearance process, making it easier for students and faculty.
							</p>
						</div>
						<div>
							<h3 className="text-white text-lg font-semibold mb-4">
								Quick Links
							</h3>
							<ul className="space-y-2">
								<li>
									<Link
										href="/about"
										className="text-sm hover:text-white transition-colors"
									>
										About Us
									</Link>
								</li>
								<li>
									<Link
										href="/contact"
										className="text-sm hover:text-white transition-colors"
									>
										Contact
									</Link>
								</li>
								<li>
									<Link
										href="/faq"
										className="text-sm hover:text-white transition-colors"
									>
										FAQ
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h3 className="text-white text-lg font-semibold mb-4">
								Contact Us
							</h3>
							<ul className="space-y-2">
								<li className="flex items-center gap-2">
									<MapPin className="h-4 w-4 text-blue-400" />
									<span className="text-sm">
										Debremarkos University, Amahara Ethiopia
									</span>
								</li>
								<li className="flex items-center gap-2">
									<Mail className="h-4 w-4 text-blue-400" />
									<span className="text-sm">support@university.edu</span>
								</li>
								<li className="flex items-center gap-2">
									<Phone className="h-4 w-4 text-blue-400" />
									<span className="text-sm">+251 (11) 123-4567</span>
								</li>
							</ul>
						</div>
						<div>
							<h3 className="text-white text-lg font-semibold mb-4">
								Connect With Us
							</h3>
							<div className="flex space-x-4">
								<a href="#" className="hover:text-white transition-colors">
									<Facebook className="h-6 w-6" />
								</a>
								<a href="#" className="hover:text-white transition-colors">
									<Twitter className="h-6 w-6" />
								</a>
								<a href="#" className="hover:text-white transition-colors">
									<Instagram className="h-6 w-6" />
								</a>
								<a href="#" className="hover:text-white transition-colors">
									<Linkedin className="h-6 w-6" />
								</a>
							</div>
						</div>
					</div>
					<div className="border-t border-gray-800 mt-8 pt-8 text-center">
						<p className="text-sm">
							© 2025 Digital Clearance System. All rights reserved.
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
