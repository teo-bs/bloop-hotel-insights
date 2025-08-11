import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export type Point = { m: string; current: number; previous: number };

const sample: Point[] = [
  { m: 'SEP', current: 18, previous: 12 },
  { m: 'OCT', current: 22, previous: 14 },
  { m: 'NOV', current: 33, previous: 19 },
  { m: 'DEC', current: 17, previous: 12 },
  { m: 'JAN', current: 41, previous: 23 },
  { m: 'FEB', current: 44, previous: 29 },
];

export default function PerformanceEvolution({
  data = sample,
  totalReviews = 150,
  delta = 2.45,
  positive = true,
}: { data?: Point[]; totalReviews?: number; delta?: number; positive?: boolean }) {
  const deltaColor = positive ? 'text-emerald-600' : 'text-rose-600';
  const deltaArrow = positive ? '▲' : '▼';

  return (
    <div className="rounded-3xl bg-white/90 backdrop-blur-md border border-slate-200/60 shadow-[0_12px_40px_rgba(2,6,23,0.08)] p-6 md:p-8">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-[220px]">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground">{totalReviews}</h3>
          <p className="mt-1 text-muted-foreground">Reviews</p>
          <p className="mt-4 text-muted-foreground">
            Performance <span className={`${deltaColor} font-semibold`}>{deltaArrow} {delta}%</span>
          </p>
          <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ${positive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            <span className={`w-2 h-2 rounded-full ${positive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            {positive ? 'Positive' : 'Needs attention'}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-end">
            <div className="rounded-full border border-slate-200/60 bg-white/70 px-4 py-2 text-foreground/80 text-sm">6 months</div>
          </div>
          <div className="mt-2 h-[220px] md:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid stroke="rgba(2,6,23,0.06)" vertical={false} />
                <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fill: '#94A3B8' }} />
                <YAxis hide />
                <Tooltip
                  cursor={{ stroke: 'rgba(26,115,232,0.2)', strokeWidth: 2 }}
                  contentStyle={{ borderRadius: 12, border: '1px solid rgba(15,23,42,.08)' }}
                />
                <Line
                  type="monotone"
                  dataKey="current"
                  stroke="hsl(var(--primary))"
                  strokeWidth={4}
                  dot={{ r: 5, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                  filter="url(#glow)"
                />
                <Line
                  type="monotone"
                  dataKey="previous"
                  stroke="hsl(var(--chart-4))"
                  strokeWidth={4}
                  dot={false}
                  strokeDasharray="0"
                  opacity={0.8}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2"><span className="inline-block w-6 h-1 rounded-full bg-[hsl(var(--primary))]" /> Actual</div>
            <div className="flex items-center gap-2"><span className="inline-block w-6 h-1 rounded-full bg-[hsl(var(--chart-4))]" /> Last Period</div>
          </div>
        </div>
      </div>
    </div>
  );
}
