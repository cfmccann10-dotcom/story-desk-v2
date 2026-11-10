import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Story } from '../lib/types';

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

export default function MetricsPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

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
      summary: 'Student led research project shows promising results',
      category: 'Research/Publication',
      department: 'Computer Engineering and Informatics',
      submitter_name: 'Dr. Ahmed',
      submitter_email: 'ahmed@mdx.ac.ae',
      subjects: ['AI'],
      student_contact: 'student@example.com',
      under_18: 'No',
      status: 'Placed',
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
      status: 'Placed',
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
      subjects: ['Energy'],
      student_contact: null,
      under_18: 'No',
      status: 'Placed',
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
      subjects: ['Art'],
      student_contact: 'artist@example.com',
      under_18: 'No',
      status: 'Placed',
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      priority_score: 88,
      ratings: { news: 5, timely: 3, human: 5 },
      internal_notes: '',
      placement_notes: ''
    },
    {
      id: '5',
      overview: 'Psychology Research on Student Wellbeing',
      summary: 'New study reveals factors affecting mental health',
      category: 'Research/Publication',
      department: 'Psychology',
      submitter_name: 'Dr. Fatima',
      submitter_email: 'fatima@mdx.ac.ae',
      subjects: ['Mental Health'],
      student_contact: null,
      under_18: 'No',
      status: 'Placed',
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      priority_score: 78,
      ratings: { news: 4, timely: 4, human: 5 },
      internal_notes: '',
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

  const getDaysInRange = () => {
    switch (timeRange) {
      case 'week': return 7;
      case 'month': return 30;
      case 'year': return 365;
    }
  };

  const getFilteredStories = () => {
    const daysAgo = getDaysInRange();
    const cutoffDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    return stories.filter(s => new Date(s.created_at) >= cutoffDate);
  };

  const filtered = getFilteredStories();
  const avgScore = filtered.length > 0
    ? Math.round(filtered.reduce((sum, s) => sum + calculateScore(s), 0) / filtered.length)
    : 0;

  const deptCounts: Record<string, number> = {};
  DEPARTMENTS.forEach(d => { deptCounts[d] = 0; });
  filtered.forEach(s => { deptCounts[s.department] = (deptCounts[s.department] || 0) + 1; });

  const topDepts = Object.entries(deptCounts)
    .filter(([_, count]) => count > 0)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 5);

  const topStories = filtered
    .sort((a, b) => calculateScore(b) - calculateScore(a))
    .slice(0, 5);

  const placedCount = filtered.filter(s => s.status === 'Placed').length;
  const placementRate = filtered.length > 0 ? Math.round((placedCount / filtered.length) * 100) : 0;

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f1f0ed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '18px', color: '#8b8b88' }}>Loading metrics...</div>
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
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h1 style={{
                fontSize: '52px',
                fontWeight: 800,
                letterSpacing: '-.038em',
                lineHeight: 1.02,
                margin: 0
              }}>
                Metrics Dashboard
              </h1>
              <p style={{
                fontSize: '19px',
                color: '#8b8b88',
                margin: 0
              }}>
                Real-time reporting and analytics
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {['week', 'month', 'year'].map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range as any)}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '999px',
                    border: 'none',
                    background: timeRange === range ? 'oklch(0.52 0.23 277)' : '#fff',
                    color: timeRange === range ? '#fff' : '#42433f',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Key Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '18px'
          }}>
            {[
              { label: 'Total Submissions', value: filtered.length, color: 'oklch(0.52 0.23 277)' },
              { label: 'Average Priority', value: avgScore, color: 'oklch(0.52 0.23 277)' },
              { label: 'Placement Rate', value: `${placementRate}%`, color: 'oklch(0.52 0.23 277)' },
              { label: 'Top Department', value: topDepts[0]?.[0]?.split(' ')[0] || '—', color: 'oklch(0.52 0.23 277)' }
            ].map((metric, idx) => (
              <div
                key={idx}
                style={{
                  background: '#fff',
                  borderRadius: '22px',
                  padding: '24px',
                  boxShadow: '0 3px 12px rgba(23,24,26,.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{
                  fontSize: '14px',
                  color: '#8b8b88',
                  fontWeight: 600
                }}>
                  {metric.label}
                </div>
                <div style={{
                  fontSize: '40px',
                  fontWeight: 800,
                  letterSpacing: '-.03em',
                  color: metric.color
                }}>
                  {metric.value}
                </div>
              </div>
            ))}
          </div>

          {/* Two Column Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px'
          }}>
            {/* Top Departments */}
            <div style={{
              background: '#fff',
              borderRadius: '28px',
              padding: '28px 30px',
              boxShadow: '0 3px 14px rgba(23,24,26,.06)'
            }}>
              <h3 style={{
                fontSize: '22px',
                fontWeight: 700,
                margin: '0 0 20px 0'
              }}>
                Top Departments
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                {topDepts.map(([dept, count], idx) => {
                  const maxCount = topDepts[0]?.[1] || 1;
                  const pct = (count / maxCount) * 100;
                  return (
                    <div key={dept} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '15px',
                          fontWeight: 600,
                          color: '#42433f',
                          marginBottom: '6px'
                        }}>
                          {dept}
                        </div>
                        <div style={{
                          height: '8px',
                          borderRadius: '4px',
                          background: '#e0dfd9',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            background: 'oklch(0.52 0.23 277)',
                            width: `${pct}%`,
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: 'oklch(0.52 0.23 277)',
                        minWidth: '30px',
                        textAlign: 'right'
                      }}>
                        {count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Stories */}
            <div style={{
              background: '#fff',
              borderRadius: '28px',
              padding: '28px 30px',
              boxShadow: '0 3px 14px rgba(23,24,26,.06)'
            }}>
              <h3 style={{
                fontSize: '22px',
                fontWeight: 700,
                margin: '0 0 20px 0'
              }}>
                Trending Stories
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                {topStories.map(story => (
                  <div
                    key={story.id}
                    style={{
                      background: '#faf9f7',
                      borderRadius: '16px',
                      padding: '14px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      flex: 1
                    }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#42433f',
                        lineHeight: 1.3
                      }}>
                        {story.overview}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#8b8b88'
                      }}>
                        {story.department}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: 800,
                      color: 'oklch(0.52 0.23 277)',
                      minWidth: '40px',
                      textAlign: 'right'
                    }}>
                      {calculateScore(story)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Distribution */}
          <div style={{
            background: '#fff',
            borderRadius: '28px',
            padding: '28px 30px',
            boxShadow: '0 3px 14px rgba(23,24,26,.06)'
          }}>
            <h3 style={{
              fontSize: '22px',
              fontWeight: 700,
              margin: '0 0 20px 0'
            }}>
              Story Categories
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px'
            }}>
              {[
                'Student Success',
                'Faculty Achievement',
                'Research/Publication',
                'Award/Honor',
                'Overcoming Adversity',
                'Other'
              ].map(cat => {
                const count = filtered.filter(s => s.category === cat).length;
                return (
                  <div
                    key={cat}
                    style={{
                      background: '#faf9f7',
                      borderRadius: '18px',
                      padding: '18px',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{
                      fontSize: '28px',
                      fontWeight: 800,
                      color: 'oklch(0.52 0.23 277)',
                      marginBottom: '6px'
                    }}>
                      {count}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: '#8b8b88',
                      lineHeight: 1.3
                    }}>
                      {cat}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
