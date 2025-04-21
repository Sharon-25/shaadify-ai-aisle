import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import AgentCard, { AgentStatus } from "@/components/AgentCard";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { RiRestaurantLine, RiHomeLine, RiPaintBrushLine, RiShirtLine, RiHotelLine, RiUser3Line, RiCameraLine, RiCarLine, RiMailSendLine, RiMoneyDollarCircleLine, RiListCheck, RiCalendarCheckLine, RiBookLine, RiCustomerService2Line, RiSunLine } from "react-icons/ri";

interface SessionData {
  id: string;
  user_id: string;
  inputs: any;
  outputs: any;
  created_at: string;
}

const agentConfigs = [
  { key: 'venue_booking', name: 'Venue Booking', icon: <RiHomeLine className="text-wedding-brown" /> },
  { key: 'decoration', name: 'Decoration Planning', icon: <RiPaintBrushLine className="text-wedding-pink" /> },
  { key: 'catering', name: 'Catering', icon: <RiRestaurantLine className="text-wedding-orange" /> },
  { key: 'stylists', name: 'Stylist Recommendations', icon: <RiUser3Line className="text-wedding-pink" /> },
  { key: 'accommodation', name: 'Accommodation', icon: <RiHotelLine className="text-wedding-brown" /> },
  { key: 'priest', name: 'Priest Booking', icon: <RiBookLine className="text-wedding-orange" /> },
  { key: 'dress', name: 'Wedding Attire', icon: <RiShirtLine className="text-wedding-pink" /> },
  { key: 'transportation', name: 'Transportation', icon: <RiCarLine className="text-wedding-brown" /> },
  { key: 'invitation', name: 'Invitation Design', icon: <RiMailSendLine className="text-wedding-pink" /> },
  { key: 'photographer', name: 'Photography', icon: <RiCameraLine className="text-wedding-orange" /> },
  { key: 'budget', name: 'Budget Planning', icon: <RiMoneyDollarCircleLine className="text-wedding-brown" /> },
  { key: 'checklist', name: 'Checklist & Timeline', icon: <RiListCheck className="text-wedding-orange" /> },
  { key: 'rituals', name: 'Ritual Guidance', icon: <RiCalendarCheckLine className="text-wedding-pink" /> },
  { key: 'guest_support', name: 'Guest Support', icon: <RiCustomerService2Line className="text-wedding-brown" /> },
  { key: 'weather', name: 'Weather Monitoring', icon: <RiSunLine className="text-wedding-orange" /> }
];

export default function Session() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user, supabase } = useAuth();
  const { toast } = useToast();
  
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [agentStatuses, setAgentStatuses] = useState<Record<string, AgentStatus>>({});
  
  useEffect(() => {
    const fetchSession = async () => {
      if (!user || !sessionId) return;
      
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('id', sessionId)
          .single();
        
        if (error) {
          throw error;
        }
        
        setSession(data);
        
        const statuses: Record<string, AgentStatus> = {};
        agentConfigs.forEach(agent => {
          if (data.outputs?.[agent.key] && data.outputs[agent.key] !== "No output found.") {
            statuses[agent.key] = "done";
          } else {
            statuses[agent.key] = "not-started";
          }
        });
        
        setAgentStatuses(statuses);
      } catch (error) {
        console.error('Error fetching session:', error);
        toast({
          variant: "destructive",
          title: "Failed to load session",
          description: "There was an error loading your wedding planning session."
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSession();
  }, [sessionId, user, supabase, toast]);
  
  const handleRerunAgent = async (agentKey: string) => {
    if (!session || !user) return;
    
    setAgentStatuses(prev => ({ ...prev, [agentKey]: "in-progress" }));
    
    try {
      const { data: { output }, error } = await supabase.functions.invoke('wedding-planner', {
        body: { 
          agentKey,
          inputs: session.inputs
        }
      });
      
      if (error) throw error;
      
      const { error: updateError } = await supabase
        .from('sessions')
        .update({
          outputs: {
            ...session.outputs,
            [agentKey]: output
          }
        })
        .eq('id', session.id);
      
      if (updateError) throw updateError;
      
      setSession(prev => ({
        ...prev!,
        outputs: {
          ...prev!.outputs,
          [agentKey]: output
        }
      }));
      
      setAgentStatuses(prev => ({ ...prev, [agentKey]: "done" }));
      
      toast({
        title: "Task completed",
        description: `${agentConfigs.find(a => a.key === agentKey)?.name} has completed its analysis.`,
      });
    } catch (error) {
      console.error('Error running agent:', error);
      setAgentStatuses(prev => ({ ...prev, [agentKey]: "failed" }));
      
      toast({
        variant: "destructive",
        title: "Task failed",
        description: `Failed to run ${agentConfigs.find(a => a.key === agentKey)?.name}. Please try again.`,
      });
    }
  };
  
  const completedAgents = Object.values(agentStatuses).filter(status => status === "done").length;
  const progress = (completedAgents / agentConfigs.length) * 100;
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p>Loading session data...</p>
        </div>
      </Layout>
    );
  }
  
  if (!session) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p>Session not found or you don't have access to it.</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="sticky top-0 bg-wedding-cream/80 backdrop-blur-sm z-10 pb-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-wedding-dark mb-2">
            {session.inputs.couple_name}'s Wedding Plan
          </h1>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <div className="text-wedding-dark/70 mb-2 md:mb-0">
              <span className="font-medium">Wedding Date:</span> {new Date(session.inputs.wedding_date).toLocaleDateString()}
              <span className="mx-2">•</span>
              <span className="font-medium">Location:</span> {session.inputs.city}
            </div>
            
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2">Progress:</span>
              <span className="text-sm font-bold mr-2">{completedAgents} / {agentConfigs.length}</span>
              <Progress value={progress} className="w-32 h-2 bg-gray-200" />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agentConfigs.map((agent) => (
            <AgentCard
              key={agent.key}
              name={agent.key}
              title={agent.name}
              icon={agent.icon}
              status={agentStatuses[agent.key] || "not-started"}
              output={session.outputs && session.outputs[agent.key] ? session.outputs[agent.key] : ""}
              onRerun={() => handleRerunAgent(agent.key)}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}
