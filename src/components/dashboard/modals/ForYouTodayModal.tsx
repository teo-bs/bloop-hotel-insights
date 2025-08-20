import { memo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, ArrowRight, AlertTriangle, Link as LinkIcon, FileText } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  type: "review" | "integration" | "report";
  priority: "high" | "medium" | "low";
  count?: number;
  lastAction?: string;
  ctaText: string;
  ctaAction: () => void;
}

interface ForYouTodayModalProps {
  tasks: Task[];
}

export default memo(function ForYouTodayModal({ tasks }: ForYouTodayModalProps) {
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
    <Dialog>
      <DialogTrigger asChild>
        <Card className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)] transition-all duration-300 rounded-2xl cursor-pointer group">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">For you today</h3>
                <p className="text-sm text-slate-600">
                  {tasks.length} task{tasks.length !== 1 ? 's' : ''} ready for action
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-blue-500" />
            For you today
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-6">
          <div className="grid gap-4">
            {tasks.map((task) => {
              const IconComponent = getTaskIcon(task.type);
              return (
                <Card key={task.id} className="bg-white border border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-5 h-5 text-slate-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-lg font-semibold text-slate-900">{task.title}</h4>
                          <Badge variant="outline" className={`text-xs px-3 py-1 ${getPriorityColor(task.priority)} whitespace-nowrap ml-2`}>
                            {task.priority} priority
                          </Badge>
                        </div>
                        <p className="text-slate-600 mb-3">{task.description}</p>
                        {task.count && (
                          <p className="text-sm text-slate-500 mb-3">{task.count} items</p>
                        )}
                        {task.lastAction && (
                          <p className="text-sm text-slate-500 mb-3">{task.lastAction}</p>
                        )}
                        <Button onClick={task.ctaAction} size="sm">
                          {task.ctaText}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});