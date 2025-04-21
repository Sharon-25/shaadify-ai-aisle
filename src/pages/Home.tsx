
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RiHeartsFill, RiBookReadLine, RiUser3Line, RiRobot2Line } from "react-icons/ri";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="bg-gradient-to-b from-wedding-pink/30 to-wedding-cream py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <RiHeartsFill className="h-12 w-12 text-wedding-pink" />
            <h1 className="text-4xl md:text-6xl font-bold text-wedding-dark">Shaadify</h1>
          </div>
          <p className="text-xl md:text-2xl text-wedding-dark mb-8">Where AI Meets Aisle!</p>
          <p className="max-w-2xl mx-auto text-wedding-dark/80 mb-10">
            Experience the future of wedding planning with our AI-powered platform. 
            Shaadify coordinates every detail of your perfect day using 15 specialized 
            AI agents that handle everything from venue booking to weather monitoring.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button 
              className="bg-wedding-pink hover:bg-wedding-pink/80 text-black px-8 py-6 text-lg"
              onClick={() => navigate(user ? '/new-session' : '/auth')}
            >
              {user ? "Start Planning" : "Get Started"}
            </Button>
            
            {user && (
              <Button 
                variant="outline"
                className="border-wedding-pink text-wedding-dark hover:bg-wedding-pink/20 px-8 py-6 text-lg"
                onClick={() => navigate('/dashboard')}
              >
                View Your Plans
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-wedding-cream">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center text-wedding-dark mb-12">How Shaadify Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-gradient p-6 rounded-xl text-center">
              <div className="bg-wedding-pink/20 p-4 rounded-full inline-flex items-center justify-center mb-4">
                <RiUser3Line className="h-8 w-8 text-wedding-pink" />
              </div>
              <h3 className="text-xl font-bold mb-2">Share Your Vision</h3>
              <p className="text-wedding-dark/80">
                Tell us about your dream wedding - your style, preferences, guest count, and budget. Our system captures all the details needed.
              </p>
            </div>
            
            <div className="card-gradient p-6 rounded-xl text-center">
              <div className="bg-wedding-pink/20 p-4 rounded-full inline-flex items-center justify-center mb-4">
                <RiRobot2Line className="h-8 w-8 text-wedding-pink" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI Agents Plan</h3>
              <p className="text-wedding-dark/80">
                Our 15 specialized AI agents work together to handle every aspect of your wedding, from venue to catering to accommodations.
              </p>
            </div>
            
            <div className="card-gradient p-6 rounded-xl text-center">
              <div className="bg-wedding-pink/20 p-4 rounded-full inline-flex items-center justify-center mb-4">
                <RiBookReadLine className="h-8 w-8 text-wedding-pink" />
              </div>
              <h3 className="text-xl font-bold mb-2">Review & Refine</h3>
              <p className="text-wedding-dark/80">
                Get comprehensive plans for each aspect of your wedding. Not satisfied? Simply rerun any agent to get alternative suggestions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-wedding-dark text-wedding-cream">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <RiHeartsFill className="h-6 w-6 text-wedding-pink" />
              <h2 className="text-xl font-bold">Shaadify</h2>
            </div>
            
            <p className="text-sm text-wedding-cream/70">
              © {new Date().getFullYear()} Shaadify. Where AI Meets Aisle!
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
