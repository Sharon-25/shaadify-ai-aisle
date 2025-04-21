
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { RiHeartsFill, RiLogoutBoxLine, RiAddLine, RiListUnordered } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface Session {
  id: string;
  couple_name: string;
  wedding_date: string;
}

export default function Sidebar() {
  const { user, signOut, supabase } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('id, inputs:inputs->couple_name, inputs:inputs->wedding_date')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching sessions:', error);
          return;
        }
        
        setSessions(data.map((session: any) => ({
          id: session.id,
          couple_name: session.inputs,
          wedding_date: session.inputs
        })) || []);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
  }, [user, supabase]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <aside className="w-64 bg-wedding-pink/20 border-r border-wedding-pink/30 flex flex-col h-full">
      <div className="p-4 border-b border-wedding-pink/30">
        <Link to="/" className="flex items-center justify-center space-x-2">
          <RiHeartsFill className="h-6 w-6 text-wedding-pink" />
          <h1 className="text-xl font-bold text-wedding-dark">Shaadify</h1>
        </Link>
      </div>
      
      <div className="p-4">
        <h2 className="text-sm font-semibold text-wedding-dark mb-4">Your Sessions</h2>
        
        <Button 
          variant="outline"
          className="w-full mb-4 border-wedding-pink text-wedding-dark hover:bg-wedding-pink/20 flex items-center justify-center gap-2"
          onClick={() => navigate('/new-session')}
        >
          <RiAddLine />
          <span>New Planning Session</span>
        </Button>
        
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {loading ? (
            <div className="text-center py-4 text-sm text-wedding-dark/70">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-4 text-sm text-wedding-dark/70">No sessions found</div>
          ) : (
            sessions.map((session) => (
              <Button 
                key={session.id}
                variant="ghost" 
                className="w-full justify-start text-left text-wedding-dark hover:bg-wedding-pink/20 overflow-hidden"
                onClick={() => navigate(`/session/${session.id}`)}
              >
                <RiListUnordered className="mr-2 h-4 w-4" />
                <div className="truncate">
                  <span className="font-medium">{session.couple_name}</span>
                  <span className="text-xs block opacity-70">{new Date(session.wedding_date).toLocaleDateString()}</span>
                </div>
              </Button>
            ))
          )}
        </div>
      </div>
      
      <div className="mt-auto p-4 border-t border-wedding-pink/30">
        {user && (
          <div className="flex flex-col space-y-4">
            <div className="text-sm text-wedding-dark/70 truncate">
              Signed in as: <span className="font-medium">{user.email}</span>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-wedding-dark hover:bg-wedding-pink/20"
              onClick={handleSignOut}
            >
              <RiLogoutBoxLine className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
