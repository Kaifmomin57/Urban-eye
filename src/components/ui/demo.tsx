import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Marquee } from '@/components/ui/3d-testimonails';

const testimonials = [
  {
    name: 'Ava Green',
    username: '@ava',
    body: 'Urban Eye made civic reporting 10x faster!',
    img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
    country: '🇦🇺 Australia',
  },
  {
    name: 'Ana Miller',
    username: '@ana',
    body: 'Real-time issue tracking is a game changer!',
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop',
    country: '🇩🇪 Germany',
  },
  {
    name: 'Mateo Rossi',
    username: '@mat',
    body: 'City response speed is buttery smooth!',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
    country: '🇮🇹 Italy',
  },
  {
    name: 'Maya Patel',
    username: '@maya',
    body: 'Reporting potholes was a breeze!',
    img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop',
    country: '🇮🇳 India',
  },
  {
    name: 'Noah Smith',
    username: '@noah',
    body: 'Best smart city governance portal!',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop',
    country: '🇺🇸 USA',
  },
  {
    name: 'Lucas Stone',
    username: '@luc',
    body: 'Very responsive and intuitive UI.',
    img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop',
    country: '🇫🇷 France',
  },
];

function TestimonialCard({ img, name, username, body, country }: (typeof testimonials)[number]) {
  return (
    <Card className="w-52 bg-white/[0.07] border-white/[0.1] text-white shadow-none">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <Avatar className="size-8 border border-white/[0.12]">
            <AvatarImage src={img} alt={name} />
            <AvatarFallback className="text-white/40 text-xs">{name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <figcaption className="text-xs font-medium text-white/60">
              {name} <span className="text-[10px] opacity-40">{country}</span>
            </figcaption>
            <p className="text-[10px] text-blue-300/50">{username}</p>
          </div>
        </div>
        <blockquote className="mt-2 text-xs text-white/35 leading-snug">{body}</blockquote>
      </CardContent>
    </Card>
  );
}

export default function DemoOne() {
  return (
    // Outer wrapper — bleeds well beyond the visible area on all sides
    <div
      className="pointer-events-none select-none overflow-hidden"
      style={{
        position: 'absolute',
        inset: '-40% -30%',          // bleed beyond the container on all 4 sides
        perspective: '400px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: '8px',
          width: '100%',
          height: '100%',
          transform: 'rotateX(20deg) rotateY(-10deg) rotateZ(18deg)',
          transformOrigin: 'center center',
        }}
      >
        {/* 5 columns — wide enough to bleed beyond all edges */}
        <Marquee vertical pauseOnHover={false} repeat={6} className="[--duration:22s] [--gap:0.3rem] flex-1">
          {testimonials.map((r) => <TestimonialCard key={`c1-${r.username}`} {...r} />)}
        </Marquee>
        <Marquee vertical pauseOnHover={false} reverse repeat={6} className="[--duration:26s] [--gap:0.3rem] flex-1">
          {testimonials.map((r) => <TestimonialCard key={`c2-${r.username}`} {...r} />)}
        </Marquee>
        <Marquee vertical pauseOnHover={false} repeat={6} className="[--duration:20s] [--gap:0.3rem] flex-1">
          {testimonials.map((r) => <TestimonialCard key={`c3-${r.username}`} {...r} />)}
        </Marquee>
        <Marquee vertical pauseOnHover={false} reverse repeat={6} className="[--duration:30s] [--gap:0.3rem] flex-1">
          {testimonials.map((r) => <TestimonialCard key={`c4-${r.username}`} {...r} />)}
        </Marquee>
        <Marquee vertical pauseOnHover={false} repeat={6} className="[--duration:24s] [--gap:0.3rem] flex-1">
          {testimonials.map((r) => <TestimonialCard key={`c5-${r.username}`} {...r} />)}
        </Marquee>
      </div>
    </div>
  );
}
