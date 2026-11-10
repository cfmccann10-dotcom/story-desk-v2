import type { Story } from '../lib/types';

interface StoryDetailModalProps {
  story: Story | null;
  onClose: () => void;
}

const STATUSES = ['New', 'Reviewing', 'Pitched', 'Placed', 'Declined', 'Archived'];

const statusColors: Record<string, { bg: string; text: string }> = {
  New: { bg: 'oklch(0.95 0.04 160)', text: 'oklch(0.4 0.11 160)' },
  Reviewing: { bg: 'oklch(0.96 0.04 80)', text: 'oklch(0.48 0.13 65)' },
  Pitched: { bg: 'oklch(0.95 0.05 300)', text: 'oklch(0.42 0.16 285)' },
  Placed: { bg: '#17181a', text: '#fff' },
  Declined: { bg: '#f1f0ed', text: '#8b8b88' },
  Archived: { bg: '#f1f0ed', text: '#8b8b88' }
};

export default function StoryDetailModal({ story, onClose }: StoryDetailModalProps) {
  if (!story) return null;

  const ageDays = Math.floor((Date.now() - new Date(story.created_at).getTime()) / (1000 * 60 * 60 * 24));
  const ageText = ageDays === 0 ? 'submitted today' : ageDays === 1 ? '1 day old' : `${ageDays} days old`;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'rgba(23,24,26,.42)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '40px 24px',
        overflowY: 'auto'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '860px',
          background: '#fff',
          borderRadius: '34px',
          padding: '38px 40px 40px',
          boxShadow: '0 24px 60px rgba(23,24,26,.28)',
          animation: 'rise 0.2s ease both',
          display: 'flex',
          flexDirection: 'column',
          gap: '22px'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '12px',
              letterSpacing: '0.16em',
              color: '#a8a7a1'
            }}>
              {story.department} · {story.category}
            </div>
            <h2 style={{
              fontSize: '34px',
              fontWeight: 800,
              letterSpacing: '-.03em',
              lineHeight: 1.12,
              margin: 0,
              wordWrap: 'break-word'
            }}>
              {story.overview}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              flex: 'none',
              background: '#f1f0ed',
              borderRadius: '999px',
              width: '46px',
              height: '46px',
              fontSize: '19px',
              color: '#5b5b57',
              cursor: 'pointer'
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Safeguarding Alert */}
        {(story.under_18 === 'Yes' || story.under_18 === 'Unsure') && (
          <div style={{
            background: 'oklch(0.96 0.045 60)',
            borderRadius: '22px',
            padding: '20px 22px'
          }}>
            <p style={{
              fontSize: '17px',
              fontWeight: 700,
              color: 'oklch(0.42 0.11 55)',
              margin: '0 0 6px 0'
            }}>
              Safeguarding — subject under 18
            </p>
            <p style={{
              fontSize: '15px',
              lineHeight: 1.5,
              color: 'oklch(0.42 0.09 55)',
              margin: 0
            }}>
              Contact the parent or guardian through the faculty submitter. Do not approach the student directly, and get written consent before pitching.
            </p>
          </div>
        )}

        {/* Story Summary */}
        <div style={{
          fontSize: '18px',
          lineHeight: 1.6,
          color: '#42433f'
        }}>
          {story.summary}
        </div>

        {/* Key Fields */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px'
        }}>
          <div style={{
            background: '#faf9f7',
            borderRadius: '18px',
            padding: '16px 18px'
          }}>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.14em',
              color: '#a8a7a1',
              marginBottom: '4px'
            }}>
              SUBMITTED BY
            </div>
            <div style={{ fontSize: '16px', lineHeight: 1.4 }}>
              {story.submitter_name}
              <br />
              <span style={{ fontSize: '14px', color: '#8b8b88' }}>
                {story.submitter_email}
              </span>
            </div>
          </div>

          <div style={{
            background: '#faf9f7',
            borderRadius: '18px',
            padding: '16px 18px'
          }}>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.14em',
              color: '#a8a7a1',
              marginBottom: '4px'
            }}>
              SUBJECT(S)
            </div>
            <div style={{ fontSize: '16px', lineHeight: 1.4 }}>
              {story.subjects?.join(', ') || '—'}
            </div>
          </div>

          {story.student_contact && (
            <div style={{
              background: '#faf9f7',
              borderRadius: '18px',
              padding: '16px 18px'
            }}>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                letterSpacing: '0.14em',
                color: '#a8a7a1',
                marginBottom: '4px'
              }}>
                STUDENT CONTACT
              </div>
              <div style={{ fontSize: '16px', lineHeight: 1.4 }}>
                {story.student_contact}
              </div>
            </div>
          )}

          <div style={{
            background: '#faf9f7',
            borderRadius: '18px',
            padding: '16px 18px'
          }}>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              letterSpacing: '0.14em',
              color: '#a8a7a1',
              marginBottom: '4px'
            }}>
              AGE
            </div>
            <div style={{ fontSize: '16px', lineHeight: 1.4 }}>
              {ageText}
            </div>
          </div>
        </div>

        {/* Priority Score */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          borderTop: '1px solid #f0efec',
          paddingTop: '22px'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: '12px'
          }}>
            <h3 style={{
              fontSize: '22px',
              fontWeight: 700,
              margin: 0
            }}>
              Priority score
            </h3>
            <div style={{
              fontSize: '44px',
              fontWeight: 800,
              letterSpacing: '-.04em',
              color: 'oklch(0.52 0.23 277)',
              lineHeight: 1
            }}>
              {story.priority_score || 0}
            </div>
          </div>

          {/* Scoring Breakdown */}
          <div style={{
            background: '#faf9f7',
            borderRadius: '20px',
            padding: '16px 18px'
          }}>
            <p style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '12px',
              color: '#a8a7a1',
              margin: 0,
              marginBottom: '8px'
            }}>
              Based on: Newsworthiness, Timeliness, Department Balance, Human Interest
            </p>
            <p style={{
              fontSize: '15px',
              color: '#5c5c58',
              margin: 0
            }}>
              Adjust ratings or add notes to recalculate
            </p>
          </div>
        </div>

        {/* Status */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          borderTop: '1px solid #f0efec',
          paddingTop: '22px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 700,
            margin: 0
          }}>
            Stage
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {STATUSES.map(status => {
              const colors = statusColors[status];
              const isSelected = story.status === status;
              return (
                <button
                  key={status}
                  style={{
                    border: 'none',
                    borderRadius: '999px',
                    padding: '13px 22px',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: isSelected ? colors.bg : '#f1f0ed',
                    color: isSelected ? colors.text : '#5b5b57'
                  }}
                >
                  {status}
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '6px' }}>
            <a
              href={`mailto:${story.submitter_email}`}
              style={{
                background: 'oklch(0.52 0.23 277)',
                color: '#fff',
                borderRadius: '999px',
                padding: '14px 22px',
                fontSize: '15px',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              Email the submitter
            </a>
          </div>
        </div>

        {/* Internal Notes */}
        {story.internal_notes && (
          <div style={{
            borderTop: '1px solid #f0efec',
            paddingTop: '22px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 700,
              margin: '0 0 12px 0'
            }}>
              Internal notes
            </h3>
            <div style={{
              background: '#faf9f7',
              borderRadius: '18px',
              padding: '16px 18px',
              fontSize: '15px',
              lineHeight: 1.5,
              color: '#42433f'
            }}>
              {story.internal_notes}
            </div>
          </div>
        )}

        {/* Placement Notes */}
        {story.placement_notes && (
          <div style={{
            borderTop: '1px solid #f0efec',
            paddingTop: '22px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 700,
              margin: '0 0 12px 0'
            }}>
              Placement notes
            </h3>
            <div style={{
              background: '#faf9f7',
              borderRadius: '18px',
              padding: '16px 18px',
              fontSize: '15px',
              lineHeight: 1.5,
              color: '#42433f'
            }}>
              {story.placement_notes}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes rise {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
