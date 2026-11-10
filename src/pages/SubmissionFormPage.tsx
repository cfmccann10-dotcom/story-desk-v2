import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

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

export default function SubmissionFormPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    overview: '',
    summary: '',
    subjects: [''],
    department: DEPARTMENTS[0],
    submitterName: '',
    submitterEmail: '',
    category: CATEGORIES[0],
    under18: '',
    studentContact: '',
    links: ''
  });

  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = (text: string) => text.trim().split(/\s+/).filter(w => w).length;
  const overviewWords = wordCount(formData.overview);
  const summaryWords = wordCount(formData.summary);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubjectChange = (index: number, value: string) => {
    const newSubjects = [...formData.subjects];
    newSubjects[index] = value;
    setFormData(prev => ({ ...prev, subjects: newSubjects }));
  };

  const addSubject = () => {
    setFormData(prev => ({ ...prev, subjects: [...prev.subjects, ''] }));
  };

  const removeSubject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== index)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.overview.trim()) return false;
    if (wordCount(formData.overview) > 15) return false;
    if (!formData.summary.trim()) return false;
    if (wordCount(formData.summary) > 100) return false;
    if (formData.subjects.filter(s => s.trim()).length === 0) return false;
    if (!formData.submitterName.trim()) return false;
    if (!formData.submitterEmail.trim()) return false;
    if (!formData.under18) return false;
    if (files.length === 0) return false;
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError('Please fill in all required fields and upload at least one file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Upload files
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const fileName = `${Date.now()}-${file.name}`;
        const { data, error: uploadError } = await supabase.storage
          .from('story-attachments')
          .upload(`stories/${fileName}`, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('story-attachments')
          .getPublicUrl(`stories/${fileName}`);

        uploadedUrls.push(publicUrl);
        setUploadProgress(Math.round((uploadedUrls.length / files.length) * 100));
      }

      // Create story record
      const { error: insertError } = await supabase
        .from('stories')
        .insert({
          overview: formData.overview,
          summary: formData.summary,
          subjects: formData.subjects.filter(s => s.trim()),
          department: formData.department,
          category: formData.category,
          status: 'New',
          submitter_name: formData.submitterName,
          submitter_email: formData.submitterEmail,
          under_18: formData.under18,
          student_contact: formData.studentContact,
          ratings: { news: 3, timely: 3, human: 3 }
        });

      if (insertError) throw insertError;

      setSubmitted(true);
      setUploadProgress(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit story');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#f1f0ed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px'
      }}>
        <div style={{
          maxWidth: '600px',
          background: '#fff',
          borderRadius: '34px',
          padding: '48px 44px',
          boxShadow: '0 4px 20px rgba(23,24,26,.07)',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'oklch(0.95 0.05 160)',
            color: 'oklch(0.4 0.11 160)',
            borderRadius: '999px',
            padding: '11px 20px',
            fontSize: '15px',
            fontWeight: 700,
            display: 'inline-block',
            marginBottom: '24px'
          }}>
            Story received
          </div>
          <h1 style={{
            fontSize: '44px',
            fontWeight: 800,
            letterSpacing: '-.035em',
            lineHeight: 1.08,
            marginBottom: '16px'
          }}>
            Thanks — it's on the PR team's board.
          </h1>
          <p style={{
            fontSize: '19px',
            color: '#8b8b88',
            lineHeight: 1.55,
            marginBottom: '24px'
          }}>
            We'll review your submission and get in touch if we need more info.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({
                overview: '',
                summary: '',
                subjects: [''],
                department: DEPARTMENTS[0],
                submitterName: '',
                submitterEmail: '',
                category: CATEGORIES[0],
                under18: '',
                studentContact: '',
                links: ''
              });
              setFiles([]);
            }}
            style={{
              border: 'none',
              padding: '18px 30px',
              borderRadius: '999px',
              background: 'oklch(0.52 0.23 277)',
              color: '#fff',
              fontSize: '17px',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '12px'
            }}
          >
            Submit another story
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container" style={{
      minHeight: '100vh',
      background: '#f1f0ed',
      padding: '40px 24px 80px'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '22px',
          marginBottom: '40px'
        }}>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '12px',
            letterSpacing: '0.22em',
            color: '#8b8b88',
            marginBottom: '8px'
          }}>
            MIDDLESEX UNIVERSITY DUBAI · PR STORY DESK
          </div>
          <h1 style={{
            fontSize: '52px',
            fontWeight: 800,
            letterSpacing: '-.038em',
            lineHeight: 1.02,
            margin: 0
          }}>
            Tell us about a story
          </h1>
          <p style={{
            fontSize: '19px',
            color: '#8b8b88',
            margin: 0
          }}>
            Two minutes, no login needed.
          </p>
        </div>

        <div style={{
          background: 'oklch(0.96 0.045 60)',
          borderRadius: '26px',
          padding: '22px 26px',
          marginBottom: '22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <p style={{
            fontSize: '17px',
            fontWeight: 700,
            color: 'oklch(0.42 0.11 55)',
            margin: 0,
            marginBottom: '8px'
          }}>
            Before you start
          </p>
          <p style={{
            fontSize: '16px',
            lineHeight: 1.55,
            color: 'oklch(0.42 0.09 55)',
            margin: 0
          }}>
            Include as much detail as you can — the fuller the submission, the stronger the pitch we can make. Submitting doesn't guarantee publication: the PR team reviews everything. Please make sure anyone named is happy to be featured, and if the subject is under 18 we'll arrange guardian consent before anything goes out.
          </p>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: '34px',
          padding: '40px 44px',
          boxShadow: '0 3px 14px rgba(23,24,26,.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '30px'
        }}>
          {/* Story Overview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: '8px',
              marginBottom: '2px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '20px', fontWeight: 700 }}>Story overview</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#a8a7a1' }}>required</span>
              </div>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '14px',
                color: overviewWords > 15 ? 'oklch(0.5 0.18 25)' : '#8b8b88'
              }}>
                {overviewWords} / 15 words
              </span>
            </div>
            <p style={{ fontSize: '15px', color: '#8b8b88', margin: 0 }}>
              One headline-style line — what happened, in plain words.
            </p>
            <input
              type="text"
              value={formData.overview}
              onChange={(e) => handleInputChange('overview', e.target.value)}
              placeholder="Computer Engineering student team wins regional hackathon"
              maxLength={200}
              style={{
                border: 'none',
                background: '#f1f0ed',
                borderRadius: '18px',
                padding: '18px 20px',
                fontSize: '17px',
                color: '#17181a',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Story Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: '8px',
              marginBottom: '2px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '20px', fontWeight: 700 }}>Story summary</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#a8a7a1' }}>required</span>
              </div>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '14px',
                color: summaryWords > 100 ? 'oklch(0.5 0.18 25)' : '#8b8b88'
              }}>
                {summaryWords} / 100 words
              </span>
            </div>
            <p style={{ fontSize: '15px', color: '#8b8b88', margin: 0 }}>
              Who, where, when, and why it's worth telling.
            </p>
            <textarea
              value={formData.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              placeholder="Four second-year students spent the weekend at the regional hackathon..."
              rows={5}
              style={{
                border: 'none',
                background: '#f1f0ed',
                borderRadius: '18px',
                padding: '18px 20px',
                fontSize: '17px',
                lineHeight: 1.5,
                color: '#17181a',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Subjects */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '2px' }}>
              <span style={{ fontSize: '20px', fontWeight: 700 }}>Story subject name(s)</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#a8a7a1' }}>required</span>
            </div>
            <p style={{ fontSize: '15px', color: '#8b8b88', margin: 0 }}>
              The people the story is about. Add a line for each one.
            </p>
            {formData.subjects.map((subject, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => handleSubjectChange(index, e.target.value)}
                  placeholder="Full name"
                  style={{
                    flex: 1,
                    border: 'none',
                    background: '#f1f0ed',
                    borderRadius: '18px',
                    padding: '16px 20px',
                    fontSize: '17px',
                    color: '#17181a'
                  }}
                />
                {formData.subjects.length > 1 && (
                  <button
                    onClick={() => removeSubject(index)}
                    style={{
                      border: 'none',
                      background: '#f1f0ed',
                      borderRadius: '999px',
                      width: '46px',
                      height: '46px',
                      fontSize: '18px',
                      color: '#8b8b88',
                      cursor: 'pointer'
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addSubject}
              style={{
                alignSelf: 'flex-start',
                padding: '14px 22px',
                borderRadius: '999px',
                background: '#fff',
                border: '1.5px solid #e2e0db',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              + Add subject
            </button>
          </div>

          {/* Department & Contact */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '2px' }}>
                <span style={{ fontSize: '20px', fontWeight: 700 }}>Department</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#a8a7a1' }}>required</span>
              </div>
              <select
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                style={{
                  border: 'none',
                  background: '#f1f0ed',
                  borderRadius: '18px',
                  padding: '18px 20px',
                  fontSize: '17px',
                  color: '#17181a'
                }}
              >
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '2px' }}>
                <span style={{ fontSize: '20px', fontWeight: 700 }}>Your contact</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#a8a7a1' }}>required</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input
                  type="text"
                  value={formData.submitterName}
                  onChange={(e) => handleInputChange('submitterName', e.target.value)}
                  placeholder="Your name"
                  style={{
                    border: 'none',
                    background: '#f1f0ed',
                    borderRadius: '18px',
                    padding: '18px 20px',
                    fontSize: '17px'
                  }}
                />
                <input
                  type="email"
                  value={formData.submitterEmail}
                  onChange={(e) => handleInputChange('submitterEmail', e.target.value)}
                  placeholder="Your email"
                  style={{
                    border: 'none',
                    background: '#f1f0ed',
                    borderRadius: '18px',
                    padding: '18px 20px',
                    fontSize: '17px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '2px' }}>
              <span style={{ fontSize: '20px', fontWeight: 700 }}>Category</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#a8a7a1' }}>required</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleInputChange('category', cat)}
                  style={{
                    border: 'none',
                    borderRadius: '999px',
                    padding: '14px 22px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: formData.category === cat ? 'oklch(0.52 0.23 277)' : '#f1f0ed',
                    color: formData.category === cat ? '#fff' : '#5b5b57'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Under 18 */}
          <div style={{
            background: 'oklch(0.95 0.05 300)',
            borderRadius: '22px',
            padding: '22px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '8px',
              flexWrap: 'wrap',
              marginBottom: '2px'
            }}>
              <span style={{ fontSize: '20px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                Is the story subject under 18?
              </span>
              <span style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'oklch(0.45 0.16 285)',
                whiteSpace: 'nowrap'
              }}>
                required
              </span>
            </div>
            <p style={{
              fontSize: '15px',
              color: 'oklch(0.42 0.09 290)',
              lineHeight: 1.5,
              margin: 0
            }}>
              If yes or unsure, we'll sort out guardian consent before anything is pitched.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {['Yes', 'No', 'Unsure'].map(option => (
                <button
                  key={option}
                  onClick={() => handleInputChange('under18', option)}
                  style={{
                    border: 'none',
                    borderRadius: '999px',
                    padding: '15px 30px',
                    fontSize: '17px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: formData.under18 === option ? 'oklch(0.52 0.23 277)' : '#fff',
                    color: formData.under18 === option ? '#fff' : 'oklch(0.42 0.16 285)'
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '2px' }}>
              <span style={{ fontSize: '20px', fontWeight: 700 }}>Attachments</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#a8a7a1' }}>required</span>
            </div>
            <p style={{ fontSize: '15px', color: '#8b8b88', margin: 0 }}>
              Upload images, documents, or video (max 10MB per file)
            </p>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed #d3d1cb',
                borderRadius: '18px',
                padding: '32px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'oklch(0.52 0.23 277)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#d3d1cb')}
            >
              <p style={{ fontSize: '17px', fontWeight: 600, color: '#17181a', margin: '0 0 8px' }}>
                Click to upload
              </p>
              <p style={{ fontSize: '14px', color: '#8b8b88', margin: 0 }}>
                or drag and drop
              </p>
              {files.length > 0 && (
                <p style={{ fontSize: '14px', color: 'oklch(0.52 0.23 277)', marginTop: '12px', fontWeight: 600 }}>
                  {files.length} file{files.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept="image/*,.pdf,.doc,.docx,.mp4,.mov,.webm"
            />
          </div>

          {/* Optional Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '2px' }}>
                <span style={{ fontSize: '20px', fontWeight: 700 }}>Student contact</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#a8a7a1' }}>optional</span>
              </div>
              <input
                type="text"
                value={formData.studentContact}
                onChange={(e) => handleInputChange('studentContact', e.target.value)}
                placeholder="Email or phone, if you have it"
                style={{
                  border: 'none',
                  background: '#f1f0ed',
                  borderRadius: '18px',
                  padding: '18px 20px',
                  fontSize: '17px'
                }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '2px' }}>
                <span style={{ fontSize: '20px', fontWeight: 700 }}>Links or quotes</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#a8a7a1' }}>optional</span>
              </div>
              <input
                type="text"
                value={formData.links}
                onChange={(e) => handleInputChange('links', e.target.value)}
                placeholder="Paste a link, or a quote we can use"
                style={{
                  border: 'none',
                  background: '#f1f0ed',
                  borderRadius: '18px',
                  padding: '18px 20px',
                  fontSize: '17px'
                }}
              />
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: 'oklch(0.96 0.05 25)',
              color: 'oklch(0.48 0.17 25)',
              borderRadius: '18px',
              padding: '16px 20px',
              fontSize: '16px',
              fontWeight: 600
            }} role="alert">
              {error}
            </div>
          )}

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div style={{
              background: 'oklch(0.95 0.04 160)',
              color: 'oklch(0.4 0.11 160)',
              borderRadius: '18px',
              padding: '16px 20px',
              fontSize: '16px',
              fontWeight: 600
            }}>
              Uploading... {uploadProgress}%
            </div>
          )}

          {/* Submit Button */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            borderTop: '1px solid #f0efec',
            paddingTop: '24px'
          }}>
            <p style={{
              fontSize: '15px',
              color: '#8b8b88',
              maxWidth: '420px',
              lineHeight: 1.5,
              margin: 0
            }}>
              We read everything. If it's a fit, you'll hear from the PR team.
            </p>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                border: 'none',
                padding: '20px 34px',
                borderRadius: '999px',
                background: loading ? '#d3d1cb' : 'oklch(0.52 0.23 277)',
                color: '#fff',
                fontSize: '18px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 10px 24px oklch(0.52 0.23 277 / .28)'
              }}
            >
              {loading ? 'Submitting...' : 'Send story'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
