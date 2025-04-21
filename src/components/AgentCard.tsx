
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RiArrowDownLine, RiRefreshLine, RiCheckLine, RiTimeLine, RiErrorWarningLine } from "react-icons/ri";
import ReactMarkdown from "react-markdown";

export type AgentStatus = "done" | "in-progress" | "failed" | "not-started";

interface AgentCardProps {
  name: string;
  title: string;
  icon: React.ReactNode;
  status: AgentStatus;
  output: string;
  onRerun: () => void;
}

export default function AgentCard({ name, title, icon, status, output, onRerun }: AgentCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusIcon = () => {
    switch (status) {
      case "done":
        return <RiCheckLine className="text-green-600" />;
      case "in-progress":
        return <RiTimeLine className="text-wedding-orange animate-pulse" />;
      case "failed":
        return <RiErrorWarningLine className="text-red-600" />;
      case "not-started":
        return <RiTimeLine className="text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "done":
        return "Completed";
      case "in-progress":
        return "In Progress";
      case "failed":
        return "Failed";
      case "not-started":
        return "Not Started";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "done":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-wedding-orange/20 text-wedding-orange";
      case "failed":
        return "bg-red-100 text-red-800";
      case "not-started":
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={setIsOpen}
      className="card-gradient overflow-hidden transition-all duration-300 ease-in-out"
    >
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-wedding-pink/20 p-2 rounded-full">
                {icon}
              </div>
              <CardTitle className="text-lg font-medium text-wedding-dark">{title}</CardTitle>
            </div>
            <Badge className={`${getStatusColor()} font-normal flex items-center gap-1`}>
              {getStatusIcon()}
              {getStatusText()}
            </Badge>
          </div>
        </CardHeader>

        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full flex items-center justify-center text-wedding-dark hover:bg-wedding-pink/10 my-1"
          >
            {isOpen ? "Hide Details" : "Show Details"}
            <RiArrowDownLine className={`ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-4 bg-white/50 rounded-md mt-2 max-h-96 overflow-y-auto">
            {output ? (
              <ReactMarkdown>
                {output}
              </ReactMarkdown>
            ) : (
              <p className="text-wedding-dark/70 italic">No output available yet.</p>
            )}
          </CardContent>
          
          <CardFooter className="pt-4">
            <Button 
              variant="outline"
              className="w-full border-wedding-pink text-wedding-dark hover:bg-wedding-pink/20"
              onClick={() => onRerun()}
              disabled={status === "in-progress"}
            >
              <RiRefreshLine className="mr-2" />
              Rerun Agent
            </Button>
          </CardFooter>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
