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

export default function ReportsPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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
      status: 'Placed',
      created_at: new Date().toISOString(),
      priority_score: 85,
      ratings: { news: 5, timely: 4, human: 3 },
      internal_notes: '',
      placement_notes: '',
      attachments: [{ id: 'a1', url: 'https://images.unsplash.com/photo-1677442d019cecf481b2ffd7eb6d9c2d?w=800&q=80', filename: 'ai-research.jpg', size: 0 }]
    },
    {
      id: '2',
      overview: 'Business Student Wins Startup Competition',
      summary: 'Graduate launches innovative fintech solution winning $50K in prize money',
      category: 'Student Success',
      department: 'Business',
      submitter_name: 'Prof. Sarah',
      submitter_email: 'sarah@mdx.ac.ae',
      subjects: ['Entrepreneurship'],
      student_contact: 'startup@example.com',
      under_18: 'No',
      status: 'Placed',
      created_at: new Date().toISOString(),
      priority_score: 72,
      ratings: { news: 4, timely: 3, human: 4 },
      internal_notes: '',
      placement_notes: '',
      attachments: [{ id: 'a2', url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80', filename: 'startup.jpg', size: 0 }]
    },
    {
      id: '3',
      overview: 'Faculty Member Published in Nature Journal',
      summary: 'Dr. Hassan publishes groundbreaking research on renewable energy solutions',
      category: 'Faculty Achievement',
      department: 'Health and Education',
      submitter_name: 'Admin',
      submitter_email: 'admin@mdx.ac.ae',
      subjects: ['Energy', 'Sustainability'],
      student_contact: null,
      under_18: 'No',
      status: 'Placed',
      created_at: new Date().toISOString(),
      priority_score: 94,
      ratings: { news: 5, timely: 5, human: 4 },
      internal_notes: '',
      placement_notes: '',
      attachments: [{ id: 'a3', url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&q=80', filename: 'research.jpg', size: 0 }]
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
      created_at: new Date().toISOString(),
      priority_score: 88,
      ratings: { news: 5, timely: 3, human: 5 },
      internal_notes: '',
      placement_notes: '',
      attachments: [{ id: 'a4', url: 'https://images.unsplash.com/photo-1578926314433-d66408a6d7ee?w=800&q=80', filename: 'art.jpg', size: 0 }]
    },
    {
      id: '5',
      overview: 'Psychology Research on Student Wellbeing',
      summary: 'New longitudinal study reveals key factors affecting mental health in students',
      category: 'Research/Publication',
      department: 'Psychology',
      submitter_name: 'Dr. Fatima',
      submitter_email: 'fatima@mdx.ac.ae',
      subjects: ['Mental Health', 'Wellbeing'],
      student_contact: null,
      under_18: 'No',
      status: 'Placed',
      created_at: new Date().toISOString(),
      priority_score: 78,
      ratings: { news: 4, timely: 4, human: 5 },
      internal_notes: '',
      placement_notes: '',
      attachments: [{ id: 'a5', url: 'https://images.unsplash.com/photo-1576091160550-112173e7f275?w=800&q=80', filename: 'wellness.jpg', size: 0 }]
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

  const getStoriesByMonth = () => {
    return stories.filter(s => {
      const storyDate = new Date(s.created_at);
      return storyDate.getMonth() === selectedMonth && storyDate.getFullYear() === selectedYear;
    });
  };

  const monthlyStories = getStoriesByMonth();

  const getDepartmentStories = (dept: string) => {
    return monthlyStories
      .filter(s => s.department === dept && s.status === 'Placed')
      .sort((a, b) => calculateScore(b) - calculateScore(a))
      .slice(0, 3);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const depsWithStories = DEPARTMENTS.filter(d => getDepartmentStories(d).length > 0);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f1f0ed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '18px', color: '#8b8b88' }}>Loading reports...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f1f0ed',
      padding: '40px'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
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
              Monthly Reports
            </h1>
            <p style={{
              fontSize: '19px',
              color: '#8b8b88',
              margin: 0
            }}>
              Highlights and achievements
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
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
              {monthNames.map((name, idx) => (
                <option key={idx} value={idx}>{name}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
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
              {[2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <button
              onClick={() => window.print()}
              style={{
                padding: '12px 24px',
                borderRadius: '999px',
                background: 'oklch(0.52 0.23 277)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Print Report
            </button>
          </div>
        </div>

        {/* Report Header */}
        <div style={{
          background: '#fff',
          borderRadius: '28px',
          padding: '48px 40px',
          marginBottom: '28px',
          textAlign: 'center',
          boxShadow: '0 3px 14px rgba(23,24,26,.06)'
        }}>
          <div style={{
            fontSize: '48px',
            fontWeight: 800,
            letterSpacing: '-.02em',
            marginBottom: '12px'
          }}>
            Story Desk Report
          </div>
          <div style={{
            fontSize: '28px',
            color: '#8b8b88',
            fontWeight: 600,
            marginBottom: '12px'
          }}>
            {monthNames[selectedMonth]} {selectedYear}
          </div>
          <div style={{
            fontSize: '16px',
            color: '#8b8b88',
            lineHeight: 1.5
          }}>
            Middlesex University Dubai · Public Relations & Media Office
          </div>
        </div>

        {/* Department Sections */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '32px'
        }}>
          {depsWithStories.length === 0 ? (
            <div style={{
              background: '#fff',
              borderRadius: '28px',
              padding: '48px',
              textAlign: 'center',
              color: '#8b8b88'
            }}>
              <p style={{ fontSize: '16px', margin: 0 }}>No stories to report for this period.</p>
              <p style={{ fontSize: '14px', margin: '8px 0 0 0', opacity: 0.7 }}>
                Try selecting a different month or year.
              </p>
            </div>
          ) : (
            depsWithStories.map((dept, deptIdx) => {
              const deptStories = getDepartmentStories(dept);
              return (
                <div key={dept} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {/* Department Header */}
                  <div style={{
                    background: 'oklch(0.52 0.23 277)',
                    color: '#fff',
                    borderRadius: '18px',
                    padding: '20px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <h2 style={{
                      fontSize: '24px',
                      fontWeight: 700,
                      margin: 0
                    }}>
                      {dept}
                    </h2>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      opacity: 0.9
                    }}>
                      {deptStories.length} highlight{deptStories.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Stories */}
                  {deptStories.map((story, storyIdx) => (
                    <div
                      key={story.id}
                      style={{
                        background: '#fff',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        boxShadow: '0 3px 14px rgba(23,24,26,.06)'
                      }}
                    >
                      {/* Image */}
                      {story.attachments && story.attachments.length > 0 && (
                        <img
                          src={story.attachments[0].url}
                          alt={story.overview}
                          style={{
                            width: '100%',
                            height: '300px',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                        />
                      )}

                      {/* Content */}
                      <div style={{
                        padding: '32px 34px',
                        display: 'flex',
                        gap: '24px',
                        alignItems: 'flex-start'
                      }}>
                        {/* Number */}
                        <div style={{
                          fontSize: '48px',
                          fontWeight: 800,
                          color: 'oklch(0.52 0.23 277)',
                          lineHeight: 1,
                          minWidth: '60px'
                        }}>
                          {storyIdx + 1}
                        </div>

                        {/* Text Content */}
                        <div style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}>
                          <div>
                            <h3 style={{
                              fontSize: '24px',
                              fontWeight: 700,
                              letterSpacing: '-.01em',
                              lineHeight: 1.2,
                              margin: '0 0 8px 0'
                            }}>
                              {story.overview}
                            </h3>
                            <p style={{
                              fontSize: '16px',
                              color: '#42433f',
                              lineHeight: 1.6,
                              margin: 0
                            }}>
                              {story.summary}
                            </p>
                          </div>

                          <div style={{
                            display: 'flex',
                            gap: '16px',
                            flexWrap: 'wrap'
                          }}>
                            <div>
                              <div style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                color: '#a8a7a1',
                                marginBottom: '2px'
                              }}>
                                CATEGORY
                              </div>
                              <div style={{
                                fontSize: '14px',
                                color: '#42433f',
                                fontWeight: 600
                              }}>
                                {story.category}
                              </div>
                            </div>

                            <div>
                              <div style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                color: '#a8a7a1',
                                marginBottom: '2px'
                              }}>
                                SUBMITTER
                              </div>
                              <div style={{
                                fontSize: '14px',
                                color: '#42433f',
                                fontWeight: 600
                              }}>
                                {story.submitter_name}
                              </div>
                            </div>

                            {story.subjects && story.subjects.length > 0 && (
                              <div>
                                <div style={{
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  color: '#a8a7a1',
                                  marginBottom: '2px'
                                }}>
                                  TOPICS
                                </div>
                                <div style={{
                                  fontSize: '14px',
                                  color: '#42433f',
                                  fontWeight: 600
                                }}>
                                  {story.subjects.join(', ')}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Priority Score */}
                        <div style={{
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          minWidth: '80px'
                        }}>
                          <div style={{
                            fontSize: '32px',
                            fontWeight: 800,
                            color: 'oklch(0.52 0.23 277)'
                          }}>
                            {calculateScore(story)}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#8b8b88',
                            fontWeight: 600
                          }}>
                            Priority
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '60px',
          paddingTop: '32px',
          borderTop: '1px solid #e0dfd9',
          textAlign: 'center',
          color: '#8b8b88',
          fontSize: '13px'
        }}>
          <p style={{ margin: '0 0 8px 0' }}>
            For more information, contact the PR & Media Office
          </p>
          <p style={{ margin: 0 }}>
            pr-media@mdx.ac.ae
          </p>
        </div>
      </div>
    </div>
  );
}
