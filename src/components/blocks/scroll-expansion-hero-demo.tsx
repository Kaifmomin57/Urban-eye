'use client';

import { useState, useEffect } from 'react';
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';

interface MediaAbout {
  overview: string;
  conclusion: string;
}

interface MediaContent {
  src: string;
  poster?: string;
  background: string;
  title: string;
  date: string;
  scrollToExpand: string;
  about: MediaAbout;
}

interface MediaContentCollection {
  [key: string]: MediaContent;
}

const sampleMediaContent: MediaContentCollection = {
  video: {
    src: 'https://me7aitdbxq.ufs.sh/f/2wsMIGDMQRdYuZ5R8ahEEZ4aQK56LizRdfBSqeDMsmUIrJN1',
    poster:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1280&auto=format&fit=crop',
    background:
      'https://images.unsplash.com/photo-1477959858617-67f30ac4ce71?q=80&w=1920&auto=format&fit=crop',
    title: 'Urban Eye Platform',
    date: 'Smart City Vision',
    scrollToExpand: 'Scroll down to expand',
    about: {
      overview:
        'Urban Eye empowers citizens and municipal teams with real-time AI-driven civic reporting, seamless spatial issue tracking, and instant emergency dispatching.',
      conclusion:
        'Transforming modern city management through transparent governance, active citizen participation, and real-time data visual analytics.',
    },
  },
  image: {
    src: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1280&auto=format&fit=crop',
    background:
      'https://images.unsplash.com/photo-1477959858617-67f30ac4ce71?q=80&w=1920&auto=format&fit=crop',
    title: 'Smart Civic Intelligence',
    date: 'Urban Surveillance',
    scrollToExpand: 'Scroll down to expand',
    about: {
      overview:
        'Experience real-time interactive mapping, automated priority scoring for reported infrastructure bugs, and transparent citizen feedback loops.',
      conclusion:
        'Engage directly with your city officers and watch civic issues transition from reported to resolved in real-time.',
    },
  },
};

const MediaContent = ({ mediaType }: { mediaType: 'video' | 'image' }) => {
  const currentMedia = sampleMediaContent[mediaType];

  return (
    <div className='max-w-4xl mx-auto text-center'>
      <h2 className='text-3xl font-bold mb-6 text-white'>
        About Urban Eye Intelligence
      </h2>
      <p className='text-lg mb-6 text-slate-300 leading-relaxed'>
        {currentMedia.about.overview}
      </p>

      <p className='text-lg mb-8 text-slate-300 leading-relaxed'>
        {currentMedia.about.conclusion}
      </p>
    </div>
  );
};

const Demo = () => {
  const [mediaType, setMediaType] = useState<'video' | 'image'>('video');
  const currentMedia = sampleMediaContent[mediaType];

  useEffect(() => {
    window.scrollTo(0, 0);

    const resetEvent = new Event('resetSection');
    window.dispatchEvent(resetEvent);
  }, [mediaType]);

  return (
    <div className='min-h-screen relative bg-slate-950'>
      <div className='fixed top-20 right-6 z-50 flex gap-2'>
        <button
          onClick={() => setMediaType('video')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            mediaType === 'video'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'bg-slate-900/80 backdrop-blur-md text-slate-300 border border-white/10 hover:bg-slate-800'
          }`}
        >
          Video Mode
        </button>

        <button
          onClick={() => setMediaType('image')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            mediaType === 'image'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'bg-slate-900/80 backdrop-blur-md text-slate-300 border border-white/10 hover:bg-slate-800'
          }`}
        >
          Image Mode
        </button>
      </div>

      <ScrollExpandMedia
        mediaType={mediaType}
        mediaSrc={currentMedia.src}
        posterSrc={mediaType === 'video' ? currentMedia.poster : undefined}
        bgImageSrc={currentMedia.background}
        title={currentMedia.title}
        date={currentMedia.date}
        scrollToExpand={currentMedia.scrollToExpand}
      >
        <MediaContent mediaType={mediaType} />
      </ScrollExpandMedia>
    </div>
  );
};

export default Demo;
