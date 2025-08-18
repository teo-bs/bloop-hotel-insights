import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Share2, Calendar } from "lucide-react";

export default function ReportsCard() {
  return (
    <Card className="bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,0.08)] hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(2,6,23,0.12)] transition-all duration-300">
      <CardHeader className="p-6">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-900">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          Reports
        </CardTitle>
        <p className="text-sm text-slate-600 mt-1">
          One-click, board-ready reports — branded with your hotel
        </p>
      </CardHeader>
      
      <CardContent className="p-6 pt-0">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button className="flex items-center justify-center gap-2 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-all duration-200 hover:scale-105">
              <Download className="w-4 h-4" />
              Download PDF report
            </Button>
            
            <Button variant="outline" className="flex items-center justify-center gap-2 h-12 rounded-xl border-slate-200/60 hover:bg-slate-50/80 font-medium transition-all duration-200 hover:scale-105">
              <Share2 className="w-4 h-4" />
              Share link with team
            </Button>
          </div>
          
          <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-200/60">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-slate-600">Last generated:</span>
              <span className="font-medium text-slate-900">Never</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Monthly reports are automatically generated on the 1st of each month
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}