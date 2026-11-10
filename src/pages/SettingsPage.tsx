import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Story } from '../lib/types';

interface ScoringWeights {
  news: number;
  timely: number;
  balance: number;
  human: number;
}

export default function SettingsPage() {
  const [weights, setWeights] = useState<ScoringWeights>({
    news: 35,
    timely: 20,
    balance: 20,
    human: 25
  });
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const { data, error } = await supabase.from('stories').select('*');
      if (error || !data) {
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
      overview: 'AI Research Breakthrough',
      summary: 'Student led research',
      category: 'Research/Publication',
      department: 'Computer Engineering and Informatics',
      submitter_name: 'Dr. Ahmed',
      submitter_email: 'ahmed@mdx.ac.ae',
      subjects: ['AI'],
      student_contact: 'student@example.com',
      under_18: 'No',
      status: 'Archived',
      created_at: new Date().toISOString(),
      priority_score: 85,
      ratings: {},
      internal_notes: '',
      placement_notes: ''
    }
  ];

  const handleWeightChange = (key: keyof ScoringWeights, value: number) => {
    const newWeights = { ...weights, [key]: value };
    const total = Object.values(newWeights).reduce((a, b) => a + b, 0);
    if (total <= 100) {
      setWeights(newWeights);
    }
  };

  const resetWeights = () => {
    setWeights({ news: 35, timely: 20, balance: 20, human: 25 });
  };

  const saveWeights = async () => {
    try {
      await supabase.from('scoring_config').upsert({
        id: 'default',
        news_weight: weights.news,
        timely_weight: weights.timely,
        balance_weight: weights.balance,
        human_weight: weights.human
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save weights:', err);
    }
  };

  const archivedStories = stories.filter(s => s.status === 'Archived');
  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f1f0ed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '18px', color: '#8b8b88' }}>Loading settings...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f1f0ed',
      padding: '40px'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h1 style={{
              fontSize: '52px',
              fontWeight: 800,
              letterSpacing: '-.038em',
              lineHeight: 1.02,
              margin: 0
            }}>
              Settings
            </h1>
            <p style={{
              fontSize: '19px',
              color: '#8b8b88',
              margin: 0
            }}>
              Configure scoring weights and archive management
            </p>
          </div>

          {/* Scoring Weights */}
          <div style={{
            background: '#fff',
            borderRadius: '28px',
            padding: '32px 34px',
            boxShadow: '0 3px 14px rgba(23,24,26,.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '28px'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: 700,
                margin: 0,
                letterSpacing: '-.01em'
              }}>
                Priority Score Weights
              </h2>
              <p style={{
                fontSize: '15px',
                color: '#8b8b88',
                margin: 0,
                lineHeight: 1.5
              }}>
                Adjust how much each factor influences the priority score. Total must equal 100.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '28px'
            }}>
              {[
                { key: 'news' as const, label: 'Newsworthiness', description: 'How newsworthy the story is' },
                { key: 'timely' as const, label: 'Timeliness', description: 'How timely and current' },
                { key: 'balance' as const, label: 'Department Balance', description: 'Balancing coverage' },
                { key: 'human' as const, label: 'Human Interest', description: 'Personal connection' }
              ].map(item => (
                <div key={item.key} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div>
                    <label style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#42433f',
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span>{item.label}</span>
                      <span style={{ color: 'oklch(0.52 0.23 277)', fontSize: '18px' }}>
                        {weights[item.key]}%
                      </span>
                    </label>
                    <p style={{
                      fontSize: '13px',
                      color: '#8b8b88',
                      margin: 0
                    }}>
                      {item.description}
                    </p>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weights[item.key]}
                    onChange={(e) => handleWeightChange(item.key, parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      height: '6px',
                      borderRadius: '3px',
                      background: '#e0dfd9',
                      outline: 'none',
                      WebkitAppearance: 'none',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              ))}
            </div>

            <div style={{
              background: '#faf9f7',
              borderRadius: '18px',
              padding: '16px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#a8a7a1',
                  marginBottom: '4px'
                }}>
                  TOTAL WEIGHT
                </div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  color: total === 100 ? 'oklch(0.52 0.23 277)' : '#d9534f'
                }}>
                  {total}%
                </div>
              </div>
              {total !== 100 && (
                <div style={{
                  fontSize: '14px',
                  color: '#d9534f',
                  fontWeight: 600
                }}>
                  Must equal 100%
                </div>
              )}
            </div>

            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={saveWeights}
                disabled={total !== 100}
                style={{
                  flex: 1,
                  padding: '16px 24px',
                  borderRadius: '999px',
                  background: total === 100 ? 'oklch(0.52 0.23 277)' : '#d3d1cb',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: total === 100 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s'
                }}
              >
                {saved ? '✓ Saved' : 'Save Weights'}
              </button>
              <button
                onClick={resetWeights}
                style={{
                  padding: '16px 24px',
                  borderRadius: '999px',
                  background: '#f1f0ed',
                  color: '#42433f',
                  fontSize: '15px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Reset
              </button>
            </div>
          </div>

          {/* Archive Management */}
          <div style={{
            background: '#fff',
            borderRadius: '28px',
            padding: '32px 34px',
            boxShadow: '0 3px 14px rgba(23,24,26,.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '22px'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: 700,
                margin: 0,
                letterSpacing: '-.01em'
              }}>
                Archive Management
              </h2>
              <p style={{
                fontSize: '15px',
                color: '#8b8b88',
                margin: 0
              }}>
                View and manage archived stories
              </p>
            </div>

            {archivedStories.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#8b8b88'
              }}>
                <p style={{ fontSize: '15px', margin: '0 0 8px 0' }}>No archived stories yet</p>
                <p style={{ fontSize: '13px', margin: 0, opacity: 0.7 }}>
                  Stories moved to Archived will appear here
                </p>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {archivedStories.map(story => (
                  <div
                    key={story.id}
                    style={{
                      background: '#faf9f7',
                      borderRadius: '16px',
                      padding: '16px 18px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#42433f'
                      }}>
                        {story.overview}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#8b8b88'
                      }}>
                        {story.department} · {new Date(story.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      style={{
                        padding: '10px 16px',
                        borderRadius: '999px',
                        background: 'oklch(0.52 0.23 277)',
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
