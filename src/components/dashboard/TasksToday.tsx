import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckSquare, 
  AlertTriangle, 
  Link as LinkIcon, 
  FileText, 
  Clock,
  ArrowRight,
  Calendar
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  type: "review" | "integration" | "report" | "general";
  priority: "high" | "medium" | "low";
  count?: number;
  lastAction?: string;
  ctaText: string;
  ctaAction: () => void;
}

interface TasksTodayProps {
  tasks: Task[];
}

export default function TasksToday({ tasks }: TasksTodayProps) {
  const getTaskIcon = (type: string) => {
    switch (type) {
      case "review": return AlertTriangle;
      case "integration": return LinkIcon;
      case "report": return FileText;
      default: return CheckSquare;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-700 bg-red-50 border-red-200";
      case "medium": return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case "low": return "text-blue-700 bg-blue-50 border-blue-200";
      default: return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)]">
        <CardHeader className="p-6">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-900">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            For you today
          </CardTitle>
          <p className="text-sm text-slate-600 mt-1">
            Quick actions that keep your reputation sharp
          </p>
        </CardHeader>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.length > 0 ? (
          tasks.map((task, index) => {
            const Icon = getTaskIcon(task.type);
            
            return (
              <Card 
                key={task.id} 
                className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)] hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(2,6,23,0.12)] transition-all duration-300 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      task.priority === "high" ? "bg-red-100" :
                      task.priority === "medium" ? "bg-yellow-100" : "bg-blue-100"
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        task.priority === "high" ? "text-red-600" :
                        task.priority === "medium" ? "text-yellow-600" : "text-blue-600"
                      }`} />
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-slate-900">{task.title}</h3>
                            {task.count && (
                              <Badge variant="outline" className="text-xs px-2 py-1">
                                {task.count} items
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                          {task.lastAction && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                              <Clock className="w-3 h-3" />
                              <span>{task.lastAction}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-3 py-1 font-medium ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} priority
                        </Badge>
                        
                        <Button 
                          size="sm" 
                          onClick={task.ctaAction}
                          className="rounded-full transition-all duration-200 group-hover:translate-x-1"
                        >
                          {task.ctaText}
                          <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)]">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <CheckSquare className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">All caught up!</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                You're all set for today. Check back later for new tasks and recommendations.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}