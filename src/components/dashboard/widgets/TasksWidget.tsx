import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Link as LinkIcon, 
  FileText, 
  Clock,
  ArrowRight,
  Calendar
} from 'lucide-react';

interface TasksWidgetProps {
  data: {
    title: string;
    subtitle: string;
  };
}

const mockTasks = [
  {
    id: "1",
    title: "New negative reviews to triage",
    description: "3 items need attention",
    type: "review" as const,
    priority: "high" as const,
    ctaText: "Review now",
  },
  {
    id: "2", 
    title: "Integration pending",
    description: "Connect Google Business Profile",
    type: "integration" as const,
    priority: "medium" as const,
    ctaText: "Connect",
  },
  {
    id: "3",
    title: "Export monthly report",
    description: "Generate January summary",
    type: "report" as const,
    priority: "low" as const,
    ctaText: "Generate",
  }
];

function TasksWidget({ data }: TasksWidgetProps) {
  const getTaskIcon = (type: string) => {
    switch (type) {
      case "review": return AlertTriangle;
      case "integration": return LinkIcon;
      case "report": return FileText;
      default: return Calendar;
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
    <div className="w-full h-full">
      <Card className="w-full h-full bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-700" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">{data.title}</CardTitle>
              <p className="text-sm text-slate-600">{data.subtitle}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3 h-[calc(100%-120px)] overflow-y-auto">
          {mockTasks.map((task, index) => {
            const Icon = getTaskIcon(task.type);
            
            return (
              <div 
                key={task.id} 
                className="p-4 rounded-xl bg-white/60 border border-slate-100 hover:bg-white/80 transition-all duration-200"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    task.priority === "high" ? "bg-red-100" :
                    task.priority === "medium" ? "bg-yellow-100" : "bg-blue-100"
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      task.priority === "high" ? "text-red-600" :
                      task.priority === "medium" ? "text-yellow-600" : "text-blue-600"
                    }`} />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{task.title}</h4>
                      <p className="text-sm text-slate-600">{task.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="outline" 
                        className={`text-xs px-2 py-1 font-medium ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </Badge>
                      
                      <Button 
                        size="sm" 
                        className="rounded-lg h-7 px-3 text-xs"
                      >
                        {task.ctaText}
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {mockTasks.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-6 w-6 text-slate-400" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-1">All caught up!</h4>
              <p className="text-sm text-slate-600">
                Check back later for new tasks.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default memo(TasksWidget);