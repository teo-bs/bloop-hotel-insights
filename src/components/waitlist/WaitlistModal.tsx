import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
// @ts-ignore
import confetti from "canvas-confetti";

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WaitlistModal({ open, onOpenChange }: WaitlistModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    hotel_name: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.role) {
      toast({
        title: "Required fields missing",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([{
          name: formData.name,
          email: formData.email,
          role: formData.role,
          hotel_name: formData.hotel_name || null
        }]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already registered",
            description: "This email is already on our waitlist!",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }

      // Success animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setSuccess(true);
      
      // Reset form after delay
      setTimeout(() => {
        setFormData({ name: "", email: "", role: "", hotel_name: "" });
        setSuccess(false);
        onOpenChange(false);
      }, 3000);

    } catch (error) {
      console.error('Waitlist signup error:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !success) {
      onOpenChange(false);
      setFormData({ name: "", email: "", role: "", hotel_name: "" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-background/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            {success ? "You're on the list! 🎉" : "Join the Padu Waitlist"}
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="text-center py-8 space-y-4">
            <div className="text-6xl animate-bounce">🎉</div>
            <p className="text-lg text-muted-foreground">
              We'll be in touch soon with exclusive early access.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your full name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-background/50 border-white/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-background/50 border-white/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger className="bg-background/50 border-white/20">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="bg-background border-white/20 backdrop-blur-xl">
                  <SelectItem value="GM">General Manager</SelectItem>
                  <SelectItem value="Owner">Owner</SelectItem>
                  <SelectItem value="CEO">CEO</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hotel_name">Hotel Name</Label>
              <Input
                id="hotel_name"
                type="text"
                placeholder="Your hotel name (optional)"
                value={formData.hotel_name}
                onChange={(e) => setFormData(prev => ({ ...prev, hotel_name: e.target.value }))}
                className="bg-background/50 border-white/20"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Joining..." : "Join Waitlist"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}