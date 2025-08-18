import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useReviews } from "@/stores/reviews";
import { useGlobalDateFilter } from "@/stores/filters";
import { filterReviews, calcAvgRating, calcTotals, calcTopTopic } from "@/lib/metrics";

// Import widget components
import MetricWidget from '@/components/dashboard/widgets/MetricWidget';
import ChartWidget from '@/components/dashboard/widgets/ChartWidget';
import InsightsWidget from '@/components/dashboard/widgets/InsightsWidget';
import TasksWidget from '@/components/dashboard/widgets/TasksWidget';
import ReviewsWidget from '@/components/dashboard/widgets/ReviewsWidget';

const nodeTypes = {
  metricWidget: MetricWidget,
  chartWidget: ChartWidget,
  insightsWidget: InsightsWidget,
  tasksWidget: TasksWidget,
  reviewsWidget: ReviewsWidget,
};

const initialNodes: Node[] = [
  {
    id: 'avg-rating',
    type: 'metricWidget',
    position: { x: 50, y: 50 },
    data: {
      title: 'Avg Guest Rating',
      value: 0,
      subtitle: 'Across all platforms',
      icon: 'star',
      trend: { value: 0.2, direction: 'up' }
    },
    style: { width: 280, height: 140 }
  },
  {
    id: 'total-reviews',
    type: 'metricWidget',
    position: { x: 350, y: 50 },
    data: {
      title: 'Total Reviews',
      value: 0,
      subtitle: 'Last 30 days',
      icon: 'users',
    },
    style: { width: 280, height: 140 }
  },
  {
    id: 'positive-sentiment',
    type: 'metricWidget',
    position: { x: 650, y: 50 },
    data: {
      title: '% Positive',
      value: 0,
      subtitle: 'Positive vs Neutral/Negative',
      icon: 'trending-up',
      trend: { value: 5, direction: 'up' }
    },
    style: { width: 280, height: 140 }
  },
  {
    id: 'top-insight',
    type: 'metricWidget',
    position: { x: 950, y: 50 },
    data: {
      title: 'Top Insight',
      value: 'Breakfast Quality',
      subtitle: 'Most mentioned theme',
      icon: 'lightbulb',
    },
    style: { width: 280, height: 140 }
  },
  {
    id: 'performance-chart',
    type: 'chartWidget',
    position: { x: 50, y: 220 },
    data: {
      title: 'Performance Evolution',
      subtitle: 'Track guest experience over time'
    },
    style: { width: 800, height: 360 }
  },
  {
    id: 'insights-panel',
    type: 'insightsWidget',
    position: { x: 880, y: 220 },
    data: {
      title: 'Top Insights',
      subtitle: 'AI-generated recommendations'
    },
    style: { width: 400, height: 360 }
  },
  {
    id: 'tasks-today',
    type: 'tasksWidget',
    position: { x: 50, y: 610 },
    data: {
      title: 'For You Today',
      subtitle: 'Quick actions needed'
    },
    style: { width: 400, height: 300 }
  },
  {
    id: 'recent-reviews',
    type: 'reviewsWidget',
    position: { x: 480, y: 610 },
    data: {
      title: 'Recent Reviews',
      subtitle: 'Latest guest feedback'
    },
    style: { width: 800, height: 300 }
  }
];

const initialEdges: Edge[] = [];

export default function Dashboard() {
  const { user } = useAuth();
  const reviews = useReviews();
  const { start, end } = useGlobalDateFilter();
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    avgRating: 0,
    totalReviews: 0,
    pctPositive: 0,
    topTopic: "—"
  });

  const firstName = user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || "User";
  const hotelName = "Grand Hotel Downtown";

  // Compute metrics
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const window = { from: start, to: end };
      const filtered = filterReviews(reviews as any, window, {});
      
      const newMetrics = {
        avgRating: calcAvgRating(filtered),
        totalReviews: calcTotals(filtered).total,
        pctPositive: calcTotals(filtered).positivePct,
        topTopic: calcTopTopic(filtered)
      };
      
      setMetrics(newMetrics);
      
      // Update node data with new metrics
      setNodes((nds) =>
        nds.map((node) => {
          switch (node.id) {
            case 'avg-rating':
              return {
                ...node,
                data: {
                  ...node.data,
                  value: newMetrics.avgRating > 0 ? newMetrics.avgRating.toFixed(1) : '—',
                  isEmpty: newMetrics.avgRating === 0
                }
              };
            case 'total-reviews':
              return {
                ...node,
                data: {
                  ...node.data,
                  value: newMetrics.totalReviews || '—',
                  isEmpty: newMetrics.totalReviews === 0
                }
              };
            case 'positive-sentiment':
              return {
                ...node,
                data: {
                  ...node.data,
                  value: newMetrics.pctPositive > 0 ? `${newMetrics.pctPositive.toFixed(0)}%` : '—',
                  isEmpty: newMetrics.pctPositive === 0
                }
              };
            case 'top-insight':
              return {
                ...node,
                data: {
                  ...node.data,
                  value: newMetrics.topTopic === "—" ? "No insights yet" : newMetrics.topTopic,
                  isEmpty: newMetrics.topTopic === "—"
                }
              };
            default:
              return node;
          }
        })
      );
      
      setIsLoading(false);
    }, 150);
    
    return () => clearTimeout(timer);
  }, [reviews, start, end, setNodes]);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // SEO
  useEffect(() => {
    document.title = `Dashboard - ${hotelName} | Padu`;
  }, [hotelName]);

  return (
    <DashboardLayout activeTab="home">
      <div className="h-[calc(100vh-64px)] bg-gpt5-gradient animate-gpt5-pan">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-6 pointer-events-none">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-slate-900">
              Hi {firstName}, here's how {hotelName} is performing
            </h1>
            <p className="text-slate-600 mt-1">Drag widgets to customize your dashboard</p>
          </div>
        </div>

        {/* React Flow Dashboard */}
        <div className="h-full pt-20">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView={false}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            minZoom={0.5}
            maxZoom={1.5}
            attributionPosition="bottom-left"
            className="react-flow-dashboard"
          >
            <Background gap={20} size={1} color="#e2e8f0" />
            <Controls 
              className="controls-minimal"
              showZoom={true}
              showFitView={true}
              showInteractive={false}
            />
          </ReactFlow>
        </div>
      </div>
    </DashboardLayout>
  );
}