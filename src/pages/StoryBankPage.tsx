import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Story } from '../lib/types';
import StoryDetailModal from '../components/StoryDetailModal';

const DEPARTMENTS = [
  'All',
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

const STATUSES = ['All', 'New', 'Reviewing', 'Pitched', 'Placed', 'Covered Internally', 'Archived'];

export default function StoryBankPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const { data, error } = await supabase.from('stories').select('*');
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
    },
    {
      id: '5',
      overview: 'Psychology Research on Student Wellbeing',
      summary: 'New study reveals factors affecting mental health in university students',
      category: 'Research/Publication',
      department: 'Psychology',
      submitter_name: 'Dr. Fatima',
      submitter_email: 'fatima@mdx.ac.ae',
      subjects: ['Mental Health', 'Wellbeing'],
      student_contact: null,
      under_18: 'No',
      status: 'Covered Internally',
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      priority_score: 78,
      ratings: { news: 4, timely: 4, human: 5 },
      internal_notes: 'Newsletter feature',
      placement_notes: ''
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

  const filteredStories = stories
    .filter(s => {
      const matchSearch = s.overview.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (s.subjects?.some(sub => sub.toLowerCase().includes(searchQuery.toLowerCase())) ?? false);
      const matchDept = selectedDept === 'All' || s.department === selectedDept;
      const matchStatus = selectedStatus === 'All' || s.status === selectedStatus;
      return matchSearch && matchDept && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        return calculateScore(b) - calculateScore(a);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const exportToCSV = () => {
    const headers = ['Headline', 'Department', 'Category', 'Status', 'Priority', 'Submitted'];
    const rows = filteredStories.map(s => [
      s.overview,
      s.department,
      s.category,
      s.status,
      calculateScore(s),
      new Date(s.created_at).toLocaleDateString()
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `story-bank-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f1f0ed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '18px', color: '#8b8b88' }}>Loading story bank...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f1f0ed',
      padding: '40px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h1 style={{
              fontSize: '52px',
              fontWeight: 800,
              letterSpacing: '-.038em',
              lineHeight: 1.02,
              margin: 0
            }}>
              Story Bank
            </h1>
            <p style={{
              fontSize: '19px',
              color: '#8b8b88',
              margin: 0
            }}>
              {filteredStories.length} stories total
            </p>
          </div>

          {/* Search */}
          <div style={{
            background: '#fff',
            borderRadius: '18px',
            padding: '20px 24px',
            boxShadow: '0 3px 12px rgba(23,24,26,.05)'
          }}>
            <input
              type="text"
              placeholder="Search headlines, subjects, content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid #e0dfd9',
                fontSize: '15px',
                background: '#faf9f7',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {DEPARTMENTS.map(dept => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  style={{
                    padding: '10px 16px',
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

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {STATUSES.map(status => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '999px',
                    border: 'none',
                    background: selectedStatus === status ? 'oklch(0.52 0.23 277)' : '#fff',
                    color: selectedStatus === status ? '#fff' : '#42433f',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: selectedStatus === status ? '0 4px 12px oklch(0.52 0.23 277 / .28)' : 'none'
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Toolbar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px'
          }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'priority')}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #e0dfd9',
                fontSize: '14px',
                background: '#fff',
                fontFamily: 'inherit',
                cursor: 'pointer'
              }}
            >
              <option value="date">Sort by: Newest</option>
              <option value="priority">Sort by: Priority Score</option>
            </select>

            <button
              onClick={exportToCSV}
              style={{
                padding: '12px 24px',
                borderRadius: '999px',
                background: 'oklch(0.52 0.23 277)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px oklch(0.52 0.23 277 / .28)'
              }}
            >
              Export CSV
            </button>
          </div>

          {/* Table */}
          <div className="table-responsive" style={{
            background: '#fff',
            borderRadius: '18px',
            overflow: 'hidden',
            boxShadow: '0 3px 12px rgba(23,24,26,.05)'
          }}>
            <div style={{
              overflowX: 'auto'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ background: '#faf9f7', borderBottom: '1px solid #e0dfd9' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#42433f' }}>Headline</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#42433f' }}>Department</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#42433f' }}>Category</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#42433f' }}>Status</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: 700, color: '#42433f' }}>Priority</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 700, color: '#42433f' }}>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStories.map((story, idx) => (
                    <tr
                      key={story.id}
                      onClick={() => setSelectedStory(story)}
                      style={{
                        borderBottom: idx < filteredStories.length - 1 ? '1px solid #e0dfd9' : 'none',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = '#faf9f7';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }}
                    >
                      <td style={{ padding: '16px', color: '#42433f' }}>{story.overview}</td>
                      <td style={{ padding: '16px', color: '#8b8b88' }}>{story.department}</td>
                      <td style={{ padding: '16px', color: '#8b8b88' }}>{story.category}</td>
                      <td style={{ padding: '16px', color: '#8b8b88' }}>{story.status}</td>
                      <td style={{ padding: '16px', textAlign: 'center', color: 'oklch(0.52 0.23 277)', fontWeight: 700 }}>
                        {calculateScore(story)}
                      </td>
                      <td style={{ padding: '16px', color: '#8b8b88' }}>
                        {new Date(story.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredStories.length === 0 && (
              <div style={{
                padding: '60px 40px',
                textAlign: 'center',
                color: '#8b8b88'
              }}>
                No stories found. Try adjusting your filters.
              </div>
            )}
          </div>
        </div>
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
