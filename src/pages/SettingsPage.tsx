import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

interface StaffMember {
  id: string;
  email: string;
  role: 'super_admin' | 'editor' | 'reviewer' | 'viewer';
  approved: boolean;
  created_at: string;
}

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'super_admin' | 'editor' | 'reviewer' | 'viewer'>('reviewer');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentUserStaff = staff.find(s => s.email === user?.email);
  const isSuperAdmin = currentUserStaff?.role === 'super_admin';

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_members')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setStaff(data || []);
    } catch (err) {
      console.error('Failed to load staff:', err);
      setError('Failed to load staff members');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setAdding(true);

    try {
      const { error } = await supabase.from('staff_members').insert({
        email: newEmail,
        role: newRole,
        approved: true,
      });

      if (error) throw error;
      setSuccess(`✅ ${newEmail} added as ${newRole}`);
      setNewEmail('');
      setNewRole('reviewer');
      await loadStaff();
    } catch (err: any) {
      setError(err.message || 'Failed to add staff member');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveStaff = async (staffId: string, email: string) => {
    if (!window.confirm(`Remove ${email}?`)) return;

    try {
      const { error } = await supabase
        .from('staff_members')
        .delete()
        .eq('id', staffId);

      if (error) throw error;
      setSuccess(`✅ ${email} removed`);
      await loadStaff();
    } catch (err: any) {
      setError(err.message || 'Failed to remove staff member');
    }
  };

  const handleChangeRole = async (staffId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('staff_members')
        .update({ role: newRole })
        .eq('id', staffId);

      if (error) throw error;
      setSuccess('✅ Role updated');
      await loadStaff();
    } catch (err: any) {
      setError(err.message || 'Failed to update role');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f1f0ed',
      padding: '40px',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '52px',
            fontWeight: 800,
            letterSpacing: '-.038em',
            lineHeight: 1.02,
            margin: '0 0 8px 0',
          }}>
            Admin Settings
          </h1>
          <p style={{
            fontSize: '19px',
            color: '#8b8b88',
            margin: 0,
          }}>
            Manage staff members and permissions
          </p>
        </div>

        {/* Add Staff Form */}
        <div style={{
          background: '#fff',
          borderRadius: '28px',
          padding: '32px 40px',
          marginBottom: '32px',
          boxShadow: '0 3px 14px rgba(23,24,26,.06)',
        }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 24px 0' }}>
            Add Staff Member
          </h2>
          
          <form onSubmit={handleAddStaff} style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(3, 1fr)', alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                Email
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="staff@example.com"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #e0dfd9',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as 'super_admin' | 'editor' | 'reviewer' | 'viewer')}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #e0dfd9',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              >
                {isSuperAdmin && <option value="super_admin">👑 Super Admin</option>}
                <option value="reviewer">Reviewer</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={adding}
              style={{
                padding: '12px 24px',
                borderRadius: '10px',
                background: 'oklch(0.52 0.23 277)',
                color: '#fff',
                fontWeight: 600,
                border: 'none',
                cursor: adding ? 'not-allowed' : 'pointer',
                opacity: adding ? 0.6 : 1,
              }}
            >
              {adding ? 'Adding...' : 'Add Staff'}
            </button>
          </form>

          {error && (
            <div style={{
              marginTop: '16px',
              background: 'oklch(0.96 0.045 60)',
              color: 'oklch(0.42 0.11 55)',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '14px',
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              marginTop: '16px',
              background: 'oklch(0.95 0.05 120)',
              color: 'oklch(0.42 0.11 120)',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '14px',
            }}>
              {success}
            </div>
          )}
        </div>

        {/* Staff List */}
        <div style={{
          background: '#fff',
          borderRadius: '28px',
          padding: '32px 40px',
          boxShadow: '0 3px 14px rgba(23,24,26,.06)',
        }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 24px 0' }}>
            Staff Members ({staff.length})
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', color: '#8b8b88' }}>Loading...</div>
          ) : staff.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#8b8b88' }}>No staff members</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {staff.map((member) => (
                <div
                  key={member.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 120px',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    background: '#f7f6f3',
                    borderRadius: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{member.email}</div>
                    <div style={{ fontSize: '12px', color: '#8b8b88' }}>
                      Added {new Date(member.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div style={{ fontWeight: 600, fontSize: '14px' }}>
                    {member.role === 'super_admin' ? '👑 Super Admin' : member.role}
                  </div>

                  <div style={{ fontSize: '14px' }}>
                    {member.role === 'super_admin' ? (
                      <span style={{ color: '#42433f' }}>Cannot change</span>
                    ) : (
                      <select
                        value={member.role}
                        onChange={(e) => handleChangeRole(member.id, e.target.value)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #e0dfd9',
                          fontSize: '12px',
                        }}
                      >
                        <option value="reviewer">Reviewer</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    )}
                  </div>

                  <div>
                    {member.role !== 'super_admin' && (
                      <button
                        onClick={() => handleRemoveStaff(member.id, member.email)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: 'oklch(0.96 0.05 25)',
                          color: 'oklch(0.48 0.17 25)',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
