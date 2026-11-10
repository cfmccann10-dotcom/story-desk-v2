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

const CATEGORIES = [
  'Student Success',
  'Faculty Achievement',
  'Research/Publication',
  'Award/Honor',
  'Overcoming Adversity',
  'Other'
];

export default function DashboardPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*');

      if (error) throw error;
      setStories(data || []);
    } catch (err) {
      console.error('Failed to load stories:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const _ageDays = (createdAt: string): number => {
    return Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
  };

  const statusCounts = {
    New: stories.filter(s => s.status === 'New').length,
    Reviewing: stories.filter(s => s.status === 'Reviewing').length,
    Pitched: stories.filter(s => s.status === 'Pitched').length,
    Placed: stories.filter(s => s.status === 'Placed').length,
    Declined: stories.filter(s => s.status === 'Declined').length,
    Archived: stories.filter(s => s.status === 'Archived').length
  };

  const deptCounts: Record<string, number> = {};
  DEPARTMENTS.forEach(d => { deptCounts[d] = 0; });
  stories.forEach(s => { deptCounts[s.department] = (deptCounts[s.department] || 0) + 1; });

  const catCounts: Record<string, number> = {};
  CATEGORIES.forEach(c => { catCounts[c] = 0; });
  stories.forEach(s => { catCounts[s.category] = (catCounts[s.category] || 0) + 1; });

  const quietDepts = DEPARTMENTS.filter(d => deptCounts[d] === 0);
  const flaggedStories = stories.filter(s => s.under_18 === 'Yes' || s.under_18 === 'Unsure');

  const topStories = stories
    .filter(s => s.status !== 'Archived' && s.status !== 'Placed')
    .sort((a, b) => calculateScore(b) - calculateScore(a))
    .slice(0, 3);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f1f0ed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '18px', color: '#8b8b88' }}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f1f0ed',
      padding: '40px'
    }}>
      <div style={{ maxWidth: '1460px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: '20px',
          marginBottom: '28px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h1 style={{
              fontSize: '52px',
              fontWeight: 800,
              letterSpacing: '-.038em',
              lineHeight: 1.02,
              margin: 0
            }}>
              Dashboard
            </h1>
            <p style={{
              fontSize: '19px',
              color: '#8b8b88',
              margin: 0
            }}>
              {stories.length} stories in the bank
            </p>
          </div>
        </div>

        {/* Top Stats */}
        <div className="stats-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 1.1fr 1.4fr',
          gap: '18px',
          marginBottom: '28px'
        }}>
          {/* Total Stories */}
          <div style={{
            background: '#fff',
            borderRadius: '30px',
            padding: '32px 34px',
            boxShadow: '0 3px 14px rgba(23,24,26,.06)'
          }}>
            <div style={{
              fontSize: '96px',
              fontWeight: 800,
              letterSpacing: '-.05em',
              lineHeight: 0.9,
              marginBottom: '8px'
            }}>
              {stories.length}
            </div>
            <p style={{
              fontSize: '17px',
              color: '#8b8b88',
              margin: 0,
              marginBottom: '8px'
            }}>
              stories in the bank, across {DEPARTMENTS.length} departments
            </p>
            <p style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'oklch(0.5 0.13 160)',
              margin: 0
            }}>
              Recently submitted
            </p>
          </div>

          {/* Quiet Departments */}
          <div style={{
            background: 'oklch(0.95 0.05 300)',
            borderRadius: '30px',
            padding: '32px 34px'
          }}>
            <div style={{
              fontSize: '96px',
              fontWeight: 800,
              letterSpacing: '-.05em',
              lineHeight: 0.9,
              color: 'oklch(0.42 0.16 285)',
              marginBottom: '8px'
            }}>
              {quietDepts.length}
            </div>
            <p style={{
              fontSize: '17px',
              color: 'oklch(0.42 0.09 290)',
              lineHeight: 1.45,
              margin: 0
            }}>
              {quietDepts.length === 0 ? 'All departments active' : 'departments with no submissions'}
            </p>
          </div>

          {/* Top Priority Stories */}
          <div style={{
            background: '#17181a',
            color: '#fff',
            borderRadius: '30px',
            padding: '30px 32px'
          }}>
            <p style={{
              fontSize: '22px',
              fontWeight: 700,
              margin: '0 0 16px 0'
            }}>
              Needs you next
            </p>
            {topStories.length === 0 ? (
              <p style={{ fontSize: '16px', color: '#a0a09c', margin: 0 }}>
                No stories pending review
              </p>
            ) : (
              topStories.map(s => (
                <div key={s.id} style={{
                  background: '#25262a',
                  borderRadius: '20px',
                  padding: '16px 18px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{
                      fontSize: '16px',
                      lineHeight: 1.3,
                      maxWidth: '200px'
                    }}>
                      {s.overview}
                    </div>
                    <div style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '11px',
                      letterSpacing: '0.12em',
                      color: '#a0a09c'
                    }}>
                      {s.department}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '26px',
                    fontWeight: 800,
                    letterSpacing: '-.03em',
                    color: 'oklch(0.78 0.16 350)'
                  }}>
                    {calculateScore(s)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Status Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '14px',
          marginBottom: '28px'
        }}>
          {[
            { label: 'New', count: statusCounts.New },
            { label: 'Reviewing', count: statusCounts.Reviewing },
            { label: 'Pitched', count: statusCounts.Pitched },
            { label: 'Placed', count: statusCounts.Placed },
            { label: 'Declined', count: statusCounts.Declined }
          ].map(status => (
            <div
              key={status.label}
              style={{
                background: '#fff',
                borderRadius: '22px',
                padding: '22px',
                boxShadow: '0 3px 12px rgba(23,24,26,.05)',
                textAlign: 'left'
              }}
            >
              <div style={{
                fontSize: '40px',
                fontWeight: 800,
                letterSpacing: '-.04em',
                lineHeight: 1,
                color: 'oklch(0.52 0.23 277)',
                marginBottom: '4px'
              }}>
                {status.count}
              </div>
              <p style={{
                fontSize: '15px',
                color: '#8b8b88',
                margin: 0
              }}>
                {status.label}
              </p>
            </div>
          ))}
        </div>

        {/* Department & Category Breakdown */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '18px'
        }}>
          {/* Department Breakdown */}
          <div style={{
            background: '#fff',
            borderRadius: '28px',
            padding: '28px 30px',
            boxShadow: '0 3px 14px rgba(23,24,26,.06)'
          }}>
            <h3 style={{
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '-.01em',
              margin: '0 0 14px 0'
            }}>
              Where stories come from
            </h3>
            {DEPARTMENTS.map(dept => {
              const count = deptCounts[dept];
              const maxCount = Math.max(...Object.values(deptCounts));
              const pct = maxCount === 0 ? 0 : (count / maxCount) * 100;
              return (
                <div
                  key={dept}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 150px 30px',
                    alignItems: 'center',
                    gap: '14px',
                    fontSize: '16px',
                    marginBottom: '12px',
                    paddingBottom: '12px',
                    borderBottom: '1px solid #f0efec'
                  }}
                >
                  <span style={{ color: '#42433f', lineHeight: 1.3 }}>{dept}</span>
                  <div style={{
                    height: '10px',
                    borderRadius: '999px',
                    background: '#f1f0ed'
                  }}>
                    <div style={{
                      height: '10px',
                      borderRadius: '999px',
                      width: `${pct}%`,
                      background: count === 0 ? '#d3d1cb' : 'oklch(0.52 0.23 277)',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <span style={{ textAlign: 'right', fontWeight: 700 }}>{count}</span>
                </div>
              );
            })}
          </div>

          {/* Alerts */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            {/* Category Breakdown */}
            <div style={{
              background: '#fff',
              borderRadius: '28px',
              padding: '28px 30px',
              boxShadow: '0 3px 14px rgba(23,24,26,.06)'
            }}>
              <h3 style={{
                fontSize: '22px',
                fontWeight: 700,
                letterSpacing: '-.01em',
                margin: '0 0 16px 0'
              }}>
                By category
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px'
              }}>
                {CATEGORIES.map(cat => (
                  <div
                    key={cat}
                    style={{
                      background: '#f7f6f3',
                      borderRadius: '18px',
                      padding: '16px 18px'
                    }}
                  >
                    <div style={{
                      fontSize: '28px',
                      fontWeight: 800,
                      letterSpacing: '-.03em'
                    }}>
                      {catCounts[cat]}
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: '#8b8b88',
                      lineHeight: 1.25,
                      margin: 0
                    }}>
                      {cat}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Flagged Alert */}
            {flaggedStories.length > 0 && (
              <div style={{
                background: 'oklch(0.96 0.045 60)',
                borderRadius: '28px',
                padding: '26px 30px'
              }}>
                <p style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: 'oklch(0.42 0.11 55)',
                  margin: '0 0 10px 0'
                }}>
                  {flaggedStories.length} flagged for safeguarding
                </p>
                <p style={{
                  fontSize: '16px',
                  lineHeight: 1.5,
                  color: 'oklch(0.42 0.09 55)',
                  margin: 0
                }}>
                  Route all contact through a parent, guardian or the faculty submitter — never the student directly — and confirm consent before any pitch.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
