// frontend/src/pages/Help.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, HelpCircle, Mail, MessageCircle } from "lucide-react";

const Help = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole] = useState<"student" | "company">("student");

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "How do I create an account?",
          a: "Click on 'Get Started' on the homepage and sign up using your email or Google account. Choose whether you're a student or company during registration.",
        },
        {
          q: "How do I complete my profile?",
          a: "After signing up, navigate to your Profile page from the navigation menu. Fill in all required information including your bio, skills, education, and upload your resume.",
        },
        {
          q: "Is InternOrbit free to use?",
          a: "Yes! InternOrbit is completely free for both students and companies. We believe in making internship opportunities accessible to everyone.",
        },
      ],
    },
    {
      category: "For Students",
      questions: [
        {
          q: "How does the swipe feature work?",
          a: "Swipe right on internships you're interested in to save them, or swipe left to skip. Your preferences help us show you more relevant opportunities.",
        },
        {
          q: "How do I apply for an internship?",
          a: "Click on any internship card to view details, then click 'Apply Now'. You'll need to submit a cover letter and resume link.",
        },
        {
          q: "Can I track my applications?",
          a: "Yes! Go to the Applications page to see all your submitted applications and their current status (pending, reviewed, accepted, rejected).",
        },
        {
          q: "What should I include in my cover letter?",
          a: "Highlight your relevant skills, explain why you're interested in the role, mention specific projects or achievements, and keep it concise but compelling.",
        },
      ],
    },
    {
      category: "For Companies",
      questions: [
        {
          q: "How do I post an internship?",
          a: "From your company dashboard, click 'Post Internship' and fill in all the details about the position, requirements, compensation, and application deadline.",
        },
        {
          q: "How can I review applications?",
          a: "Go to the Applicants page to see all applications for your internships. You can filter by status and update application statuses as you review candidates.",
        },
        {
          q: "Can I edit or delete my internship postings?",
          a: "Yes! Go to the Internships page, find the posting you want to modify, and use the edit or delete buttons.",
        },
        {
          q: "How do I update my company profile?",
          a: "Navigate to Company Profile from the menu and update your company information, logo, and description.",
        },
      ],
    },
    {
      category: "Account & Privacy",
      questions: [
        {
          q: "How do I change my password?",
          a: "Go to Settings > Security tab and use the Change Password form. You'll need to enter your new password twice to confirm.",
        },
        {
          q: "How do I delete my account?",
          a: "In Settings > Security tab, scroll to the Danger Zone section. Click 'Delete Account' and confirm. This action cannot be undone.",
        },
        {
          q: "How is my data protected?",
          a: "We use industry-standard encryption and security practices. Your personal information is never sold to third parties.",
        },
      ],
    },
    {
      category: "Technical Issues",
      questions: [
        {
          q: "The site isn't loading properly. What should I do?",
          a: "Try refreshing the page, clearing your browser cache, or using a different browser. If issues persist, contact our support team.",
        },
        {
          q: "I'm not receiving notification emails",
          a: "Check your spam/junk folder and make sure email notifications are enabled in Settings > Notifications.",
        },
        {
          q: "My resume link isn't working",
          a: "Make sure your resume is uploaded to a service like Google Drive or Dropbox and the sharing settings allow anyone with the link to view.",
        },
      ],
    },
  ];

  const filteredFaqs = faqs.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (q) =>
        searchQuery === "" ||
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              How can we help?
            </h1>
            <p className="text-muted-foreground mb-6">
              Find answers to common questions or contact our support team
            </p>

            {/* Search */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search for help..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Contact Options */}
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            <Card className="shadow-card hover:shadow-elevated transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email Support</h3>
                    <p className="text-sm text-muted-foreground">support@InternOrbit.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-elevated transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Live Chat</h3>
                    <p className="text-sm text-muted-foreground">Available Mon-Fri, 9am-5pm</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQs */}
          <div className="space-y-8">
            {filteredFaqs.length === 0 ? (
              <Card className="text-center p-12">
                <HelpCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try different keywords or contact our support team
                </p>
              </Card>
            ) : (
              filteredFaqs.map((category, idx) => (
                <Card key={idx} className="shadow-card">
                  <CardHeader>
                    <CardTitle>{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, qIdx) => (
                        <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`}>
                          <AccordionTrigger className="text-left">
                            {faq.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Still need help */}
          <Card className="mt-12 bg-gradient-card shadow-elevated">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-2">Still need help?</h3>
              <p className="text-muted-foreground mb-6">
                Our support team is here to assist you
              </p>
              <Button
                onClick={() => navigate("/contact")}
                className="bg-gradient-primary"
              >
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Help;