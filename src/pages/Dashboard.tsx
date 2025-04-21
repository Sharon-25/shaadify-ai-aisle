
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RiAddLine, RiCalendarLine, RiGroupLine } from "react-icons/ri";
import Layout from "@/components/Layout";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Session {
  id: string;
  inputs: {
    couple_name: string;
    wedding_date: string;
    city: string;
  };
  created_at: string;
}

export default function Dashboard() {
  const { user, supabase } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching sessions:', error);
          return;
        }
        
        setSessions(data || []);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
  }, [user, supabase]);

  const deleteSession = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setSessions(sessions.filter(session => session.id !== id));
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-wedding-dark">Your Wedding Plans</h1>
          <Button 
            className="bg-wedding-pink hover:bg-wedding-pink/80 text-black"
            onClick={() => navigate('/new-session')}
          >
            <RiAddLine className="mr-2" />
            New Planning Session
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center py-20">
            <p>Loading your wedding plans...</p>
          </div>
        ) : sessions.length === 0 ? (
          <Card className="text-center py-20 card-gradient">
            <CardContent>
              <h3 className="text-xl font-medium mb-4">No wedding plans yet</h3>
              <p className="mb-6">Create your first wedding planning session to get started!</p>
              <Button 
                className="bg-wedding-pink hover:bg-wedding-pink/80 text-black"
                onClick={() => navigate('/new-session')}
              >
                <RiAddLine className="mr-2" />
                Create Wedding Plan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <Card key={session.id} className="overflow-hidden hover:shadow-lg transition-shadow card-gradient">
                <CardHeader>
                  <CardTitle className="truncate text-wedding-dark">
                    {session.inputs?.couple_name || "Unnamed Couple"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-wedding-dark/70">
                      <RiCalendarLine className="mr-2" />
                      {session.inputs?.wedding_date ? new Date(session.inputs.wedding_date).toLocaleDateString() : "No date set"}
                    </div>
                    <div className="flex items-center text-wedding-dark/70">
                      <RiGroupLine className="mr-2" />
                      {session.inputs?.city || "No location set"}
                    </div>
                    <div className="text-xs text-wedding-dark/50">
                      Created: {new Date(session.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    className="border-wedding-pink text-wedding-dark hover:bg-wedding-pink/20"
                    onClick={() => navigate(`/session/${session.id}`)}
                  >
                    View Plan
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your wedding planning session.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteSession(session.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
