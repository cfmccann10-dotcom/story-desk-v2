import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Story } from '../lib/types';
import StoryDetailModal from '../components/StoryDetailModal';

const STATUSES = ['New', 'Reviewing', 'Pitched', 'Placed', 'Covered Internally', 'Archived'];
const DEPARTMENTS = [
  'Business',
  'Accounting and Finance',
  'Health and Education',
  'Psychology',
  'Computer Engineering and Informatics',
  'Media',
  'Art and Design',
  'Law',
  'Daytime MBA',
  'Executive MBA',
  'Sport Science',
  'International Foundation Programme (IFP)',
  'Other'
];

const statusColors: Record<string, { bg: string; text: string }> = {
  New: { bg: 'oklch(0.95 0.04 160)', text: 'oklch(0.4 0.11 160)' },
  Reviewing: { bg: 'oklch(0.96 0.04 80)', text: 'oklch(0.48 0.13 65)' },
  Pitched: { bg: 'oklch(0.95 0.05 300)', text: 'oklch(0.42 0.16 285)' },
  Placed: { bg: '#17181a', text: '#fff' },
  'Covered Internally': { bg: 'oklch(0.95 0.05 120)', text: 'oklch(0.42 0.11 120)' },
  Archived: { bg: '#f1f0ed', text: '#5b5b57' }
};

export default function BoardPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [draggedStory, setDraggedStory] = useState<Story | null>(null);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*');
      if (error || !data || data.length === 0) {
        setStories(getTestData());
      } else {
        setStories(data);
      }
    } catch (err) {
      console.error('Failed to load stories:', err);
      setStories(getTestData());
    } finally {
      setLoading(false);
    }
  };

  const getTestData = (): Story[] => [
    {
      id: '1',
      overview: 'AI Research Breakthrough in NLP',
      summary: 'Student led research project shows promising results in natural language processing',
      category: 'Research/Publication',
      department: 'Computer Engineering and Informatics',
      submitter_name: 'Dr. Ahmed',
      submitter_email: 'ahmed@mdx.ac.ae',
      subjects: ['AI', 'Research'],
      student_contact: 'student@example.com',
      under_18: 'No',
      status: 'New',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      priority_score: 85,
      ratings: { news: 5, timely: 4, human: 3 },
      internal_notes: '',
      placement_notes: ''
    },
    {
      id: '2',
      overview: 'Business Student Wins Startup Competition',
      summary: 'Graduate launches innovative fintech solution',
      category: 'Student Success',
      department: 'Business',
      submitter_name: 'Prof. Sarah',
      submitter_email: 'sarah@mdx.ac.ae',
      subjects: ['Entrepreneurship'],
      student_contact: 'startup@example.com',
      under_18: 'No',
      status: 'Reviewing',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      priority_score: 72,
      ratings: { news: 4, timely: 3, human: 4 },
      internal_notes: '',
      placement_notes: ''
    },
    {
      id: '3',
      overview: 'Faculty Member Published in Nature Journal',
      summary: 'Dr. Hassan publishes groundbreaking research on renewable energy',
      category: 'Faculty Achievement',
      department: 'Health and Education',
      submitter_name: 'Admin',
      submitter_email: 'admin@mdx.ac.ae',
      subjects: ['Energy', 'Sustainability'],
      student_contact: null,
      under_18: 'No',
      status: 'Pitched',
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      priority_score: 94,
      ratings: { news: 5, timely: 5, human: 4 },
      internal_notes: '',
      placement_notes: ''
    },
    {
      id: '4',
      overview: 'Student Wins International Art Award',
      summary: 'Contemporary art installation recognized globally',
      category: 'Award/Honor',
      department: 'Art and Design',
      submitter_name: 'Prof. Lisa',
      submitter_email: 'lisa@mdx.ac.ae',
      subjects: ['Art', 'Design'],
      student_contact: 'artist@example.com',
      under_18: 'No',
      status: 'Placed',
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      priority_score: 88,
      ratings: { news: 5, timely: 3, human: 5 },
      internal_notes: 'Published in Gulf News',
      placement_notes: 'Featured in university newsletter'
    }
  ];

  const calculateScore = (story: Story): number => {
    const weights = { news: 35, timely: 20, balance: 20, human: 25 };
    const ratings = story.ratings || {};
    const vals = {
      news: ratings.news || 3,
      timely: ratings.timely || 3,
      human: ratings.human || 3,
      balance: 3
    };
    const tot = weights.news + weights.timely + weights.balance + weights.human;
    const sum = ['news', 'timely', 'balance', 'human'].reduce(
      (a, k) => a + weights[k as keyof typeof weights] * (vals[k as keyof typeof vals] / 5),
      0
    );
    return Math.round((sum / tot) * 100);
  };

  const updateStoryStatus = (story: Story, newStatus: string) => {
    setStories(stories.map(s => s.id === story.id ? { ...s, status: newStatus } : s));
    setDraggedStory(null);

    supabase
      .from('stories')
      .update({ status: newStatus })
      .eq('id', story.id)
      .then(() => console.log('Story updated'))
      .catch((err) => console.log('Offline: story not saved to DB:', err));
  };

  const filteredStories = selectedDept === 'All'
    ? stories
    : stories.filter(s => s.department === selectedDept);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f1f0ed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '18px', color: '#8b8b88' }}>Loading board...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f1f0ed',
      padding: '40px',
      display: 'flex',
      flexDirection: 'column',
      gap: '28px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h1 style={{
          fontSize: '52px',
          fontWeight: 800,
          letterSpacing: '-.038em',
          lineHeight: 1.02,
          margin: 0
        }}>
          Kanban Board
        </h1>
        <p style={{
          fontSize: '19px',
          color: '#8b8b88',
          margin: 0
        }}>
          {filteredStories.length} stories · Drag cards to change status
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {['All', ...DEPARTMENTS].map(dept => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            style={{
              padding: '12px 18px',
              borderRadius: '999px',
              border: 'none',
              background: selectedDept === dept ? 'oklch(0.52 0.23 277)' : '#fff',
              color: selectedDept === dept ? '#fff' : '#42433f',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: selectedDept === dept ? '0 4px 12px oklch(0.52 0.23 277 / .28)' : 'none'
            }}
          >
            {dept}
          </button>
        ))}
      </div>

      <div className="board-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '20px',
        maxWidth: '1600px'
      }}>
        {STATUSES.map(status => {
          const columnStories = filteredStories.filter(s => s.status === status);
          const colors = statusColors[status];
          return (
            <div
              key={status}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => draggedStory && updateStoryStatus(draggedStory, status)}
              style={{
                background: '#fff',
                borderRadius: '22px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                minHeight: '600px',
                border: '2px solid transparent',
                transition: 'border-color 0.2s'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                paddingBottom: '12px',
                borderBottom: '2px solid #f0efec'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '6px',
                  background: colors.text
                }} />
                <div style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#42433f'
                }}>
                  {status}
                </div>
                <div style={{
                  marginLeft: 'auto',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#8b8b88'
                }}>
                  {columnStories.length}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                {columnStories.map(story => (
                  <div
                    key={story.id}
                    draggable
                    onDragStart={() => setDraggedStory(story)}
                    onClick={() => setSelectedStory(story)}
                    style={{
                      background: colors.bg,
                      borderRadius: '16px',
                      padding: '16px',
                      cursor: 'grab',
                      transition: 'transform 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = 'none';
                    }}
                  >
                    <div style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: colors.text,
                      lineHeight: 1.3
                    }}>
                      {story.overview}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: colors.text,
                      opacity: 0.7
                    }}>
                      {story.department}
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '4px'
                    }}>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: colors.text,
                        opacity: 0.8
                      }}>
                        {story.category}
                      </div>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: 800,
                        color: 'oklch(0.52 0.23 277)'
                      }}>
                        {calculateScore(story)}
                      </div>
                    </div>
                  </div>
                ))}
                {columnStories.length === 0 && (
                  <div style={{
                    fontSize: '14px',
                    color: '#d3d1cb',
                    textAlign: 'center',
                    paddingTop: '40px',
                    opacity: 0.6
                  }}>
                    No stories
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedStory && (
        <StoryDetailModal
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      )}
    </div>
  );
}
