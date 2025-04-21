import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import Layout from "@/components/Layout";

export default function NewSession() {
  const { user, supabase } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    coupleName: "",
    weddingDate: "",
    weddingTime: "",
    guestCount: "",
    travelAccommodationCount: "",
    budget: "",
    culture: "",
    cateringType: "",
    inviteCount: "",
    city: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not authorized",
        description: "Please sign in to create a new session",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const sessionData = {
        user_id: user.id,
        inputs: {
          couple_name: formData.coupleName,
          wedding_date: formData.weddingDate,
          wedding_time: formData.weddingTime,
          guest_count: parseInt(formData.guestCount),
          travel_accommodation_count: parseInt(formData.travelAccommodationCount),
          budget: parseInt(formData.budget),
          culture: formData.culture,
          catering_type: formData.cateringType,
          invite_count: parseInt(formData.inviteCount),
          city: formData.city,
        }
      };
      
      const { data: newSession, error } = await supabase
        .from('sessions')
        .insert([sessionData])
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "Your wedding planning session has been created.",
      });
      
      if (newSession) {
        navigate(`/session/${newSession.id}`);
      }
    } catch (error) {
      console.error("Error creating session:", error);
      toast({
        variant: "destructive",
        title: "Failed to create session",
        description: "There was an error creating your session. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-wedding-dark mb-8 text-center">Create New Planning Session</h1>
        
        <Card className="max-w-3xl mx-auto card-gradient">
          <CardHeader>
            <CardTitle className="text-wedding-dark">Wedding Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="coupleName">Couple Name</Label>
                  <Input
                    id="coupleName"
                    name="coupleName"
                    placeholder="e.g., John & Jane"
                    value={formData.coupleName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="e.g., Mumbai"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weddingDate">Wedding Date</Label>
                  <Input
                    id="weddingDate"
                    name="weddingDate"
                    type="date"
                    value={formData.weddingDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weddingTime">Wedding Time</Label>
                  <Input
                    id="weddingTime"
                    name="weddingTime"
                    type="time"
                    value={formData.weddingTime}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guestCount">Number of Guests</Label>
                  <Input
                    id="guestCount"
                    name="guestCount"
                    type="number"
                    placeholder="e.g., 200"
                    value={formData.guestCount}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="travelAccommodationCount">Guests Needing Accommodation</Label>
                  <Input
                    id="travelAccommodationCount"
                    name="travelAccommodationCount"
                    type="number"
                    placeholder="e.g., 50"
                    value={formData.travelAccommodationCount}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inviteCount">Number of Invitations</Label>
                  <Input
                    id="inviteCount"
                    name="inviteCount"
                    type="number"
                    placeholder="e.g., 150"
                    value={formData.inviteCount}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Total Budget (₹)</Label>
                  <Input
                    id="budget"
                    name="budget"
                    type="number"
                    placeholder="e.g., 1000000"
                    value={formData.budget}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="culture">Culture/Religion</Label>
                  <Select 
                    value={formData.culture} 
                    onValueChange={(value) => handleSelectChange("culture", value)}
                    required
                  >
                    <SelectTrigger id="culture">
                      <SelectValue placeholder="Select culture" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hindu">Hindu</SelectItem>
                      <SelectItem value="Muslim">Muslim</SelectItem>
                      <SelectItem value="Sikh">Sikh</SelectItem>
                      <SelectItem value="Christian">Christian</SelectItem>
                      <SelectItem value="Jain">Jain</SelectItem>
                      <SelectItem value="Buddhist">Buddhist</SelectItem>
                      <SelectItem value="Parsi">Parsi</SelectItem>
                      <SelectItem value="Interfaith">Interfaith</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cateringType">Catering Type</Label>
                  <Select 
                    value={formData.cateringType} 
                    onValueChange={(value) => handleSelectChange("cateringType", value)}
                    required
                  >
                    <SelectTrigger id="cateringType">
                      <SelectValue placeholder="Select catering type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="veg">Vegetarian</SelectItem>
                      <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-wedding-pink hover:bg-wedding-pink/80 text-black"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Session..." : "Create Planning Session"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
