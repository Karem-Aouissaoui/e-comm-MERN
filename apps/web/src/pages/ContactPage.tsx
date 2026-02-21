import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Mail, MapPin } from "lucide-react";

export function ContactPage() {
  return (
    <div className="animate-fade-in max-w-5xl mx-auto py-12 px-4 space-y-12">
      
      {/* Intro */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Contact Us</h1>
        <p className="text-lg text-muted-foreground">
          Have questions, feedback, or partnership ideas? Reach out to us using the form below or send us an email.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         
         {/* Contact Info */}
         <div className="lg:col-span-5">
            <Card className="h-full bg-white shadow-lg">
               <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                     <h4 className="text-xl font-bold text-primary flex items-center gap-2">
                        <Mail className="h-5 w-5" /> Email
                     </h4>
                     <p>
                        <a href="mailto:support@middleeastb2b.com" className="text-primary hover:underline font-medium">
                           support@middleeastb2b.com
                        </a>
                     </p>
                  </div>
                  
                  <div className="space-y-4">
                     <h4 className="text-xl font-bold text-primary flex items-center gap-2">
                        <MapPin className="h-5 w-5" /> Address
                     </h4>
                     <p className="text-muted-foreground leading-relaxed">
                        Riyadh, Saudi Arabia<br/>
                        Middle-East Trade Zone
                     </p>
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* Contact Form */}
         <div className="lg:col-span-7">
            <Card className="shadow-lg">
               <CardContent className="p-8">
                  <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label htmlFor="name" className="text-sm font-semibold text-gray-700">Your Name</label>
                           <Input id="name" placeholder="Enter your name" required className="bg-slate-50 border-blue-100 focus:border-primary" />
                        </div>
                        <div className="space-y-2">
                           <label htmlFor="email" className="text-sm font-semibold text-gray-700">Your Email</label>
                           <Input id="email" type="email" placeholder="Enter your email" required className="bg-slate-50 border-blue-100 focus:border-primary" />
                        </div>
                     </div>
                     
                     <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-semibold text-gray-700">Message</label>
                        <textarea 
                           id="message" 
                           rows={5} 
                           placeholder="Write your message here..." 
                           className="flex w-full rounded-2xl border border-blue-100 bg-slate-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                     </div>

                     <Button type="submit" size="lg" className="w-full text-base font-bold shadow-md">
                        Send Message
                     </Button>
                  </form>
               </CardContent>
            </Card>
         </div>

      </div>
    </div>
  );
}
