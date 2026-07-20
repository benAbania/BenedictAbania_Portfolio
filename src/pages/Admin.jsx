import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import * as htmlToImage from 'html-to-image'
import { jsPDF } from 'jspdf'

export default function Admin({ session }) {
  const [activeTab, setActiveTab] = useState('profile')
  const [profileData, setProfileData] = useState({ 
    id: null, name: '', title: '', headline: '', bio: '', avatar_url: '', email: '', phone: '', location: '', facebook_url: '', instagram_url: '', linkedin_url: ''
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // PROJECTS
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [newProject, setNewProject] = useState({ title: '', role: '', category: 'Main', goal: '', highlights: [], link_url: '', image_url: '' })
  const [resumeProjects, setResumeProjects] = useState([])
  
  // SKILLS, EDUCATION, CERTS, EXP, INTERESTS
  const [skills, setSkills] = useState([])
  const [newSkill, setNewSkill] = useState({ name: '', category: 'Project Management', icon_name: '' })
  const [resumeSkills, setResumeSkills] = useState([]) // NEW: Resume skills state
  const skillCategories = ['Project Management', 'Documentation', 'Technical Literacy']
  const [education, setEducation] = useState([])
  const [newEdu, setNewEdu] = useState({ degree: '', field_of_study: '', institution: '', location: '', start_date: '', end_date: '' })
  const [certifications, setCertifications] = useState([])
  const [newCert, setNewCert] = useState({ name: '', issuer: '', issue_date: '', status: '' })
  const [resumeCerts, setResumeCerts] = useState([])
  const [experiences, setExperiences] = useState([])
  const [newExp, setNewExp] = useState({ company: '', position: '', start_date: '', end_date: '', is_current: false, bullets: [] })
  const [resumeExps, setResumeExps] = useState([])
  const [interests, setInterests] = useState([])
  const [newInterest, setNewInterest] = useState({ name: '' })
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  useEffect(() => {
    if (session) {
      fetchProfile(); fetchProjects(); fetchSkills(); fetchEducation(); fetchCertifications(); fetchExperiences(); fetchInterests()
    }
  }, [session])

  // --- FETCHERS ---
  const fetchProfile = async () => { const { data } = await supabase.from('profiles').select('*').limit(1).single(); if (data) setProfileData(data) }
  const fetchProjects = async () => { const { data } = await supabase.from('projects').select('*').order('id', { ascending: true }); if (data) { setProjects(data); setResumeProjects(data.map(p => p.id)) } }
  
  // NEW: Updated to automatically select all skills for the resume initially
  const fetchSkills = async () => { const { data } = await supabase.from('skills').select('*').order('id', { ascending: true }); if (data) { setSkills(data); setResumeSkills(data.map(s => s.id)) } }
  
  const fetchEducation = async () => { const { data } = await supabase.from('education').select('*').order('start_date', { ascending: false }); if (data) setEducation(data) }
  const fetchCertifications = async () => { const { data } = await supabase.from('certifications').select('*').order('issue_date', { ascending: false }); if (data) { setCertifications(data); setResumeCerts(data.map(c => c.id)) } }
  const fetchExperiences = async () => { const { data } = await supabase.from('experience').select('*').order('start_date', { ascending: false }); if (data) { setExperiences(data); setResumeExps(data.map(e => e.id)) } }
  const fetchInterests = async () => { const { data } = await supabase.from('interests').select('*').order('id', { ascending: true }); if (data) setInterests(data) }

  // --- SAVE & ADD HANDLERS ---
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('profiles').update(profileData).eq('id', profileData.id)
    setSaving(false)
    if (!error) alert("Profile updated successfully!")
    else alert("Error saving profile: " + error.message)
  }

  const handleSaveProject = async (e) => {
    e.preventDefault()
    setSaving(true)
    const cleanedHighlights = (selectedProject.highlights || []).filter(h => h.trim() !== '')
    const { error } = await supabase.from('projects').update({
      title: selectedProject.title, 
      role: selectedProject.role,
      category: selectedProject.category,
      goal: selectedProject.goal, 
      highlights: cleanedHighlights,
      link_url: selectedProject.link_url,
      image_url: selectedProject.image_url
    }).eq('id', selectedProject.id)
    setSaving(false)
    if (!error) { alert("Project updated successfully!"); setSelectedProject(null); fetchProjects() } 
    else alert("Error saving project: " + error.message)
  }

  const handleAddProject = async (e) => {
    e.preventDefault()
    if (!newProject.title.trim()) return
    setSaving(true)
    const cleanedHighlights = (newProject.highlights || []).filter(h => h.trim() !== '')
    const payload = {
      title: newProject.title,
      role: newProject.role,
      category: newProject.category,
      goal: newProject.goal,
      highlights: cleanedHighlights,
      link_url: newProject.link_url || null,
      image_url: newProject.image_url || null,
      profile_id: profileData.id
    }
    const { error } = await supabase.from('projects').insert([payload])
    setSaving(false)
    if (!error) {
      setNewProject({ title: '', role: '', category: 'Main', goal: '', highlights: [], link_url: '', image_url: '' })
      fetchProjects()
    } else alert("Error adding project: " + error.message)
  }

  const handleDeleteProject = async (id) => { if(!window.confirm("Are you sure?")) return; const { error } = await supabase.from('projects').delete().eq('id', id); if (!error) fetchProjects() }

  // Array Handlers
  const handleHighlightChange = (index, value) => { const newHighlights = [...(selectedProject.highlights || [])]; newHighlights[index] = value; setSelectedProject({ ...selectedProject, highlights: newHighlights }) }
  const addHighlight = () => setSelectedProject({ ...selectedProject, highlights: [...(selectedProject.highlights || []), ""] })
  const removeHighlight = (index) => { const newHighlights = [...(selectedProject.highlights || [])]; newHighlights.splice(index, 1); setSelectedProject({ ...selectedProject, highlights: newHighlights }) }

  const handleNewProjectHighlightChange = (index, value) => { const newHighlights = [...(newProject.highlights || [])]; newHighlights[index] = value; setNewProject({ ...newProject, highlights: newHighlights }) }
  const addNewProjectHighlight = () => setNewProject({ ...newProject, highlights: [...(newProject.highlights || []), ""] })
  const removeNewProjectHighlight = (index) => { const newHighlights = [...(newProject.highlights || [])]; newHighlights.splice(index, 1); setNewProject({ ...newProject, highlights: newHighlights }) }

  const handleExpBulletChange = (index, value) => { const newBullets = [...(newExp.bullets || [])]; newBullets[index] = value; setNewExp({ ...newExp, bullets: newBullets }) }
  const addExpBullet = () => setNewExp({ ...newExp, bullets: [...(newExp.bullets || []), ""] })
  const removeExpBullet = (index) => { const newBullets = [...(newExp.bullets || [])]; newBullets.splice(index, 1); setNewExp({ ...newExp, bullets: newBullets }) }

  // Other Add/Delete
  const handleAddSkill = async (e) => { e.preventDefault(); if (!newSkill.name.trim()) return; setSaving(true); const { error } = await supabase.from('skills').insert([{ ...newSkill, profile_id: profileData.id }]); setSaving(false); if (!error) { setNewSkill({ ...newSkill, name: '', icon_name: '' }); fetchSkills() } }
  const handleDeleteSkill = async (id) => { const { error } = await supabase.from('skills').delete().eq('id', id); if (!error) fetchSkills() }

  const handleAddEducation = async (e) => { e.preventDefault(); if (!newEdu.degree.trim()) return; setSaving(true); const payload = { ...newEdu, profile_id: profileData.id }; if (!payload.start_date) payload.start_date = null; if (!payload.end_date) payload.end_date = null; const { error } = await supabase.from('education').insert([payload]); setSaving(false); if (!error) { setNewEdu({ degree: '', field_of_study: '', institution: '', location: '', start_date: '', end_date: '' }); fetchEducation() } }
  const handleDeleteEducation = async (id) => { const { error } = await supabase.from('education').delete().eq('id', id); if (!error) fetchEducation() }

  const handleAddCertification = async (e) => { e.preventDefault(); if (!newCert.name.trim()) return; setSaving(true); const payload = { ...newCert, profile_id: profileData.id }; if (!payload.issue_date) payload.issue_date = null; if (!payload.status) payload.status = null; const { error } = await supabase.from('certifications').insert([payload]); setSaving(false); if (!error) { setNewCert({ name: '', issuer: '', issue_date: '', status: '' }); fetchCertifications() } else alert("Error: " + error.message) }
  const handleDeleteCertification = async (id) => { const { error } = await supabase.from('certifications').delete().eq('id', id); if (!error) fetchCertifications() }

  const handleAddExperience = async (e) => { e.preventDefault(); if (!newExp.company.trim() || !newExp.position.trim()) return; setSaving(true); const cleanedBullets = (newExp.bullets || []).filter(b => b.trim() !== ''); const payload = { company: newExp.company, position: newExp.position, start_date: newExp.start_date || null, end_date: newExp.is_current ? null : (newExp.end_date || null), is_current: newExp.is_current, bullets: cleanedBullets, profile_id: profileData.id }; const { error } = await supabase.from('experience').insert([payload]); setSaving(false); if (!error) { setNewExp({ company: '', position: '', start_date: '', end_date: '', is_current: false, bullets: [] }); fetchExperiences() } else alert("Error: " + error.message) }
  const handleDeleteExperience = async (id) => { const { error } = await supabase.from('experience').delete().eq('id', id); if (!error) fetchExperiences() }

  const handleAddInterest = async (e) => { e.preventDefault(); if (!newInterest.name.trim()) return; setSaving(true); const { error } = await supabase.from('interests').insert([{ name: newInterest.name, profile_id: profileData.id }]); setSaving(false); if (!error) { setNewInterest({ name: '' }); fetchInterests() } }
  const handleDeleteInterest = async (id) => { const { error } = await supabase.from('interests').delete().eq('id', id); if (!error) fetchInterests() }

  // Resume Generator Toggles
  const toggleResumeProject = (id) => setResumeProjects(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleResumeCert = (id) => setResumeCerts(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleResumeExp = (id) => setResumeExps(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleResumeSkill = (id) => setResumeSkills(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]) // NEW: Skill Toggle

  const handleLogout = async () => await supabase.auth.signOut()

  const generatePDF = async () => {
    setIsGeneratingPDF(true)
    const element = document.getElementById('resume-pdf-content')
    try {
      const dataUrl = await htmlToImage.toPng(element, { pixelRatio: 2 })
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      const imgProps = pdf.getImageProperties(dataUrl)
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width
      
      let heightLeft = imgHeight
      let position = 0

      // Put the image on the first page
      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight)
      heightLeft -= pageHeight

      // If the content is longer than one page, automatically add new pages
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight // Shifts the image up by exactly one page height
        pdf.addPage()
        pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(profileData.name ? `${profileData.name.replace(/\s+/g, '_')}_Resume.pdf` : 'My_Resume.pdf')
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF.")
    } finally { 
      setIsGeneratingPDF(false) 
    }
  }

  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [loginError, setLoginError] = useState(null)
  const handleLogin = async (e) => { e.preventDefault(); setLoading(true); setLoginError(null); const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) setLoginError(error.message); setLoading(false) }

  if (!session) return (<div className="min-h-screen bg-black text-white flex items-center justify-center p-4"><div className="bg-[#141414] p-8 rounded-3xl border border-gray-800 w-full max-w-md"><h1 className="text-2xl font-medium mb-6 text-center">Admin Login</h1>{loginError && <div className="bg-red-900/30 text-red-500 p-3 rounded-lg text-sm mb-4">{loginError}</div>}<form onSubmit={handleLogin} className="space-y-4"><div><label className="block text-gray-400 text-sm mb-1">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3" required /></div><div><label className="block text-gray-400 text-sm mb-1">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3" required /></div><button type="submit" disabled={loading} className="w-full bg-white text-black font-medium py-3 rounded-xl hover:bg-gray-200 disabled:opacity-50">{loading ? 'Logging in...' : 'Sign In'}</button></form></div></div>)

  const placeholderImage = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239ca3af'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 overflow-hidden relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b border-gray-800 gap-4">
          <div><h1 className="text-2xl font-medium">Portfolio CMS</h1><p className="text-gray-500 text-sm">Manage your content and generate resumes.</p></div>
          <button onClick={handleLogout} className="bg-red-900/30 text-red-500 px-4 py-2 rounded-lg text-sm border border-red-800/50 hover:bg-red-900/50">Sign Out</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="space-y-2 md:col-span-1">
            <button onClick={() => setActiveTab('profile')} className={`w-full text-left px-4 py-3 rounded-lg font-medium ${activeTab === 'profile' ? 'bg-[#141414] border border-gray-800 text-white' : 'text-gray-400 hover:bg-[#141414]'}`}>Profile & Bio</button>
            <button onClick={() => { setActiveTab('cases'); setSelectedProject(null); }} className={`w-full text-left px-4 py-3 rounded-lg ${activeTab === 'cases' ? 'bg-[#141414] border border-gray-800 text-white font-medium' : 'text-gray-400 hover:bg-[#141414]'}`}>Case Studies</button>
            <button onClick={() => setActiveTab('experience')} className={`w-full text-left px-4 py-3 rounded-lg ${activeTab === 'experience' ? 'bg-[#141414] border border-gray-800 text-white font-medium' : 'text-gray-400 hover:bg-[#141414]'}`}>Experience</button>
            <button onClick={() => setActiveTab('skills')} className={`w-full text-left px-4 py-3 rounded-lg ${activeTab === 'skills' ? 'bg-[#141414] border border-gray-800 text-white font-medium' : 'text-gray-400 hover:bg-[#141414]'}`}>Skills Toolkit</button>
            <button onClick={() => setActiveTab('education')} className={`w-full text-left px-4 py-3 rounded-lg ${activeTab === 'education' ? 'bg-[#141414] border border-gray-800 text-white font-medium' : 'text-gray-400 hover:bg-[#141414]'}`}>Education</button>
            <button onClick={() => setActiveTab('certifications')} className={`w-full text-left px-4 py-3 rounded-lg ${activeTab === 'certifications' ? 'bg-[#141414] border border-gray-800 text-white font-medium' : 'text-gray-400 hover:bg-[#141414]'}`}>Certifications</button>
            <button onClick={() => setActiveTab('interests')} className={`w-full text-left px-4 py-3 rounded-lg ${activeTab === 'interests' ? 'bg-[#141414] border border-gray-800 text-white font-medium' : 'text-gray-400 hover:bg-[#141414]'}`}>Interests</button>
            <button onClick={() => setActiveTab('resume')} className={`w-full text-left px-4 py-3 rounded-lg border mt-8 ${activeTab === 'resume' ? 'text-blue-400 border-blue-900/50 bg-blue-900/20 font-medium' : 'text-blue-400 border-blue-900/30 bg-blue-900/10'}`}>📄 Resume Generator</button>
          </div>

          <div className="md:col-span-4 bg-[#141414] rounded-3xl p-6 md:p-8 border border-gray-800/50">
            
            {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-gray-400 text-sm mb-2">Display Name</label><input type="text" value={profileData.name || ''} onChange={(e) => setProfileData({...profileData, name: e.target.value})} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3" /></div>
                    <div><label className="block text-gray-400 text-sm mb-2">Title (e.g. Project Manager)</label><input type="text" value={profileData.title || ''} onChange={(e) => setProfileData({...profileData, title: e.target.value})} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3" /></div>
                  </div>
                  <div><label className="block text-gray-400 text-sm mb-2">Headline</label><textarea value={profileData.headline || ''} onChange={(e) => setProfileData({...profileData, headline: e.target.value})} rows="2" className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 resize-none text-white" placeholder="e.g. My name is..., and I am a Computer Science senior..." /></div>
                  <div><label className="block text-gray-400 text-sm mb-2">Main Bio</label><textarea value={profileData.bio || ''} onChange={(e) => setProfileData({...profileData, bio: e.target.value})} rows="4" className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 resize-none" /></div>
                  <div><label className="block text-gray-400 text-sm mb-2">Avatar URL (Link to your profile image)</label><input type="text" value={profileData.avatar_url || ''} onChange={(e) => setProfileData({...profileData, avatar_url: e.target.value})} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3" placeholder="https://..." /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-gray-400 text-sm mb-2">Email</label><input type="email" value={profileData.email || ''} onChange={(e) => setProfileData({...profileData, email: e.target.value})} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3" /></div>
                    <div><label className="block text-gray-400 text-sm mb-2">Phone</label><input type="text" value={profileData.phone || ''} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3" /></div>
                  </div>
                  <div><label className="block text-gray-400 text-sm mb-2">Location</label><input type="text" value={profileData.location || ''} onChange={(e) => setProfileData({...profileData, location: e.target.value})} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3" /></div>
                  <h3 className="text-lg font-medium text-white pt-4 border-t border-gray-800">Social Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label className="block text-gray-400 text-sm mb-2">LinkedIn URL</label><input type="text" value={profileData.linkedin_url || ''} onChange={(e) => setProfileData({...profileData, linkedin_url: e.target.value})} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3" placeholder="https://linkedin.com/in/..." /></div>
                    <div><label className="block text-gray-400 text-sm mb-2">Instagram URL</label><input type="text" value={profileData.instagram_url || ''} onChange={(e) => setProfileData({...profileData, instagram_url: e.target.value})} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3" placeholder="https://instagram.com/..." /></div>
                    <div><label className="block text-gray-400 text-sm mb-2">Facebook URL</label><input type="text" value={profileData.facebook_url || ''} onChange={(e) => setProfileData({...profileData, facebook_url: e.target.value})} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3" placeholder="https://facebook.com/..." /></div>
                  </div>
                  <button type="submit" disabled={saving} className="bg-white text-black font-medium px-6 py-3 rounded-xl mt-4">{saving ? 'Saving...' : 'Save Profile Changes'}</button>
                </form>
            )}

            {activeTab === 'cases' && (
              <div>
                <h2 className="text-xl font-medium mb-6">{selectedProject ? `Editing: ${selectedProject.title}` : 'Manage Case Studies & Projects'}</h2>
                
                {selectedProject ? (
                  <form className="space-y-6" onSubmit={handleSaveProject}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className="block text-gray-400 text-sm mb-2">Project Title</label><input className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3" value={selectedProject.title || ''} onChange={(e) => setSelectedProject({...selectedProject, title: e.target.value})} required /></div>
                      <div><label className="block text-gray-400 text-sm mb-2">Role</label><input className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3" value={selectedProject.role || ''} onChange={(e) => setSelectedProject({...selectedProject, role: e.target.value})} /></div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Category</label>
                        <select value={selectedProject.category || 'Main'} onChange={(e) => setSelectedProject({...selectedProject, category: e.target.value})} className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3">
                          <option value="Main">Main Project</option>
                          <option value="Other">Other Project</option>
                        </select>
                      </div>
                      <div><label className="block text-gray-400 text-sm mb-2">Link URL (Optional)</label><input className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3" value={selectedProject.link_url || ''} onChange={(e) => setSelectedProject({...selectedProject, link_url: e.target.value})} /></div>
                    </div>
                    
                    <div><label className="block text-gray-400 text-sm mb-2">Project Image URL (Thumbnail)</label><input className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3" placeholder="https://..." value={selectedProject.image_url || ''} onChange={(e) => setSelectedProject({...selectedProject, image_url: e.target.value})} /></div>
                    
                    <div><label className="block text-gray-400 text-sm mb-2">The Goal</label><textarea className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 resize-none" rows="3" value={selectedProject.goal || ''} onChange={(e) => setSelectedProject({...selectedProject, goal: e.target.value})} /></div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Project Highlights (Bullet Points)</label>
                      <div className="space-y-3">
                        {(selectedProject.highlights || []).map((highlight, index) => (
                          <div key={index} className="flex gap-2">
                            <input type="text" value={highlight} onChange={(e) => handleHighlightChange(index, e.target.value)} className="w-full bg-[#141414] border border-gray-800 rounded-lg px-3 py-2" />
                            <button type="button" onClick={() => removeHighlight(index)} className="text-gray-500 hover:text-red-400 px-2">✕</button>
                          </div>
                        ))}
                      </div>
                      <button type="button" onClick={addHighlight} className="mt-3 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">+ Add Bullet Point</button>
                    </div>
                    <div className="flex gap-4 pt-4 border-t border-gray-800/50">
                      <button type="submit" disabled={saving} className="bg-white text-black px-6 py-3 rounded-xl font-medium">{saving ? 'Saving...' : 'Save Project'}</button>
                      <button type="button" onClick={() => setSelectedProject(null)} className="text-gray-400 px-4 py-3">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <form onSubmit={handleAddProject} className="space-y-4 mb-8 bg-[#0a0a0a] p-6 rounded-xl border border-gray-800">
                      <h3 className="font-medium text-white mb-4">Add New Project</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-gray-400 text-sm mb-1">Project Title</label><input type="text" required value={newProject.title} onChange={(e) => setNewProject({...newProject, title: e.target.value})} className="w-full bg-[#141414] border border-gray-800 rounded-lg px-3 py-2" /></div>
                        <div><label className="block text-gray-400 text-sm mb-1">Role</label><input type="text" value={newProject.role} onChange={(e) => setNewProject({...newProject, role: e.target.value})} className="w-full bg-[#141414] border border-gray-800 rounded-lg px-3 py-2" /></div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Category</label>
                          <select value={newProject.category} onChange={(e) => setNewProject({...newProject, category: e.target.value})} className="w-full bg-[#141414] border border-gray-800 rounded-lg px-3 py-2">
                            <option value="Main">Main Project</option>
                            <option value="Other">Other Project</option>
                          </select>
                        </div>
                        <div><label className="block text-gray-400 text-sm mb-1">Link URL (Optional)</label><input type="text" value={newProject.link_url} onChange={(e) => setNewProject({...newProject, link_url: e.target.value})} className="w-full bg-[#141414] border border-gray-800 rounded-lg px-3 py-2" /></div>
                      </div>
                      
                      <div><label className="block text-gray-400 text-sm mb-1">Project Image URL (Thumbnail)</label><input type="text" placeholder="https://..." value={newProject.image_url} onChange={(e) => setNewProject({...newProject, image_url: e.target.value})} className="w-full bg-[#141414] border border-gray-800 rounded-lg px-3 py-2" /></div>
                      
                      <div><label className="block text-gray-400 text-sm mb-1">The Goal</label><textarea value={newProject.goal} onChange={(e) => setNewProject({...newProject, goal: e.target.value})} className="w-full bg-[#141414] border border-gray-800 rounded-lg px-3 py-2 resize-none" rows="2" /></div>
                      
                      <div className="pt-2">
                        <label className="block text-gray-400 text-sm mb-2">Project Highlights</label>
                        <div className="space-y-3">
                          {(newProject.highlights || []).map((highlight, index) => (
                            <div key={index} className="flex gap-2">
                              <input type="text" value={highlight} onChange={(e) => handleNewProjectHighlightChange(index, e.target.value)} className="w-full bg-[#141414] border border-gray-800 rounded-lg px-3 py-2" />
                              <button type="button" onClick={() => removeNewProjectHighlight(index)} className="text-gray-500 hover:text-red-400 px-2">✕</button>
                            </div>
                          ))}
                        </div>
                        <button type="button" onClick={addNewProjectHighlight} className="mt-3 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">+ Add Bullet Point</button>
                      </div>

                      <button type="submit" disabled={saving} className="bg-white text-black font-medium px-6 py-2 rounded-lg mt-4">Add Project</button>
                    </form>

                    <div className="space-y-4">
                      {projects.map((project) => (
                        <div key={project.id} className="bg-[#141414] p-4 rounded-xl border border-gray-800 flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            {project.image_url && <img src={project.image_url} alt="" className="w-10 h-10 object-cover rounded" />}
                            <div>
                              <span className="font-medium text-white block">{project.title}</span>
                              <span className="text-sm text-gray-500">{project.category} Project {project.role ? `• ${project.role}` : ''}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <button onClick={() => setSelectedProject(project)} className="text-blue-400 text-sm hover:underline">Edit</button>
                            <button onClick={() => handleDeleteProject(project.id)} className="text-red-500 text-sm hover:underline">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'experience' && (
              <div>
                <h2 className="text-xl font-medium mb-6">Manage Experience</h2>
                <form onSubmit={handleAddExperience} className="space-y-4 mb-8 bg-[#0a0a0a] p-6 rounded-xl border border-gray-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-gray-400 text-sm mb-1">Company</label><input type="text" required value={newExp.company} onChange={(e) => setNewExp({...newExp, company: e.target.value})} className="w-full bg-[#141414] border border-gray-800 rounded-lg px-3 py-2" placeholder="e.g. Meetzed" /></div>
                    <div><label className="block text-gray-400 text-sm mb-1">Position</label><input type="text" required value={newExp.position} onChange={(e) => setNewExp({...newExp, position: e.target.value})} className="w-full bg-[#141414] border border-gray-800 rounded-lg px-3 py-2" placeholder="e.g. Graphic Designer" /></div>
                    <div><label className="block text-gray-400 text-sm mb-1">Start Date</label><input type="date" value={newExp.start_date} onChange={(e) => setNewExp({...newExp, start_date: e.target.value})} className="w-full bg-[#141414] border border-gray-800 rounded-lg px-3 py-2 [color-scheme:dark]" /></div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1 flex items-center justify-between">
                        End Date
                        <label className="flex items-center gap-2 text-xs text-blue-400 cursor-pointer">
                          <input type="checkbox" checked={newExp.is_current} onChange={(e) => setNewExp({...newExp, is_current: e.target.checked})} className="accent-blue-500 rounded bg-black border-gray-700"/> Current Role
                        </label>
                      </label>
                      <input type="date" disabled={newExp.is_current} value={newExp.end_date} onChange={(e) => setNewExp({...newExp, end_date: e.target.value})} className="w-full bg-[#141414] border border-gray-800 rounded-lg px-3 py-2 [color-scheme:dark] disabled:opacity-50" />
                    </div>
                  </div>
                  <div className="pt-2">
                    <label className="block text-gray-400 text-sm mb-2">Job Bullets</label>
                    <div className="space-y-3">
                      {(newExp.bullets || []).map((bullet, index) => (
                        <div key={index} className="flex gap-2">
                          <input type="text" value={bullet} onChange={(e) => handleExpBulletChange(index, e.target.value)} className="w-full bg-[#141414] border border-gray-800 rounded-lg px-3 py-2 text-white" />
                          <button type="button" onClick={() => removeExpBullet(index)} className="text-gray-500 hover:text-red-400 px-2">✕</button>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={addExpBullet} className="mt-3 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">+ Add Bullet Point</button>
                  </div>
                  <button type="submit" disabled={saving} className="bg-white text-black font-medium px-6 py-2 rounded-lg mt-4">Add Experience</button>
                </form>
                <div className="space-y-4">
                  {experiences.map(exp => (
                    <div key={exp.id} className="bg-[#141414] p-4 rounded-xl border border-gray-800 flex justify-between items-start">
                      <div><h4 className="font-bold text-lg">{exp.company}</h4><p className="text-blue-400 text-sm">{exp.position} ({exp.start_date ? exp.start_date.substring(0,4) : ''} - {exp.is_current ? 'Present' : (exp.end_date ? exp.end_date.substring(0,4) : '')})</p></div>
                      <button onClick={() => handleDeleteExperience(exp.id)} className="text-red-500 text-sm hover:underline ml-4 flex-shrink-0">Delete</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'interests' && (
              <div>
                <h2 className="text-xl font-medium mb-6">Manage Interests</h2>
                <form onSubmit={handleAddInterest} className="flex gap-4 mb-8 bg-[#0a0a0a] p-4 rounded-xl border border-gray-800">
                  <div className="flex-1"><label className="block text-gray-400 text-sm mb-1">Interest Name</label><input type="text" required value={newInterest.name} onChange={(e) => setNewInterest({...newInterest, name: e.target.value})} className="w-full bg-[#141414] border border-gray-800 rounded-lg px-3 py-2" placeholder="e.g. 🎮 Gaming" /></div>
                  <div className="flex items-end"><button type="submit" disabled={saving} className="bg-white text-black font-medium px-6 py-2 rounded-lg">Add</button></div>
                </form>
                <div className="flex flex-wrap gap-3">{interests.map(interest => (<span key={interest.id} className="bg-[#141414] border border-gray-800 px-4 py-2 rounded-xl flex items-center gap-2">{interest.name}<button onClick={() => handleDeleteInterest(interest.id)} className="text-gray-500 hover:text-red-400 ml-2">✕</button></span>))}</div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div>
                <h2 className="text-xl font-medium mb-6">Manage Skills</h2>
                <form onSubmit={handleAddSkill} className="flex gap-4 mb-8 bg-[#0a0a0a] p-4 rounded-xl border border-gray-800">
                  <div className="flex-1"><label className="block text-gray-400 text-sm mb-1">Skill Name</label><input type="text" required value={newSkill.name} onChange={(e) => setNewSkill({...newSkill, name: e.target.value})} className="w-full bg-[#141414] border border-gray-800 rounded-lg px-3 py-2" /></div>
                  <div className="flex-1"><label className="block text-gray-400 text-sm mb-1">Category</label><select value={newSkill.category} onChange={(e) => setNewSkill({...newSkill, category: e.target.value})} className="w-full bg-[#141414] border border-gray-800 rounded-lg px-3 py-2">{skillCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}</select></div>
                  <div className="flex items-end"><button type="submit" disabled={saving} className="bg-white text-black font-medium px-6 py-2 rounded-lg">Add</button></div>
                </form>
                <div className="space-y-8">{skillCategories.map(category => { const categorySkills = skills.filter(s => s.category === category); if (categorySkills.length === 0) return null; return (<div key={category}><h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">{category}</h3><div className="flex flex-wrap gap-2">{categorySkills.map(skill => (<span key={skill.id} className="bg-[#0a0a0a] border border-gray-800 px-4 py-2 rounded-full text-sm flex gap-2">{skill.name}<button onClick={() => handleDeleteSkill(skill.id)} className="text-gray-500 hover:text-red-400 ml-1">✕</button></span>))}</div></div>) })}</div>
              </div>
            )}

            {activeTab === 'education' && (
              <div>
                <h2 className="text-xl font-medium mb-6">Manage Education</h2>
                <form onSubmit={handleAddEducation} className="space-y-4 mb-8 bg-[#0a0a0a] p-6 rounded-xl border border-gray-800">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-gray-400 text-sm mb-1">Degree</label><input type="text" required value={newEdu.degree} onChange={(e) => setNewEdu({...newEdu, degree: e.target.value})} className="w-full bg-[#141414] border border-gray-800 rounded-lg px-3 py-2" /></div>
                    <div><label className="block text-gray-400 text-sm mb-1">Field of Study</label><input type="text" value={newEdu.field_of_study} onChange={(e) => setNewEdu({...newEdu, field_of_study: e.target.value})} className="w-full bg-[#141414] border border-gray-800 rounded-lg px-3 py-2" /></div>
                    <div><label className="block text-gray-400 text-sm mb-1">Institution</label><input type="text" required value={newEdu.institution} onChange={(e) => setNewEdu({...newEdu, institution: e.target.value})} className="w-full bg-[#141414] border border-gray-800 rounded-lg px-3 py-2" /></div>
                    <div><label className="block text-gray-400 text-sm mb-1">Location</label><input type="text" value={newEdu.location} onChange={(e) => setNewEdu({...newEdu, location: e.target.value})} className="w-full bg-[#141414] border border-gray-800 rounded-lg px-3 py-2" /></div>
                    <div><label className="block text-gray-400 text-sm mb-1">Start Date</label><input type="date" value={newEdu.start_date} onChange={(e) => setNewEdu({...newEdu, start_date: e.target.value})} className="w-full bg-[#141414] border border-gray-800 rounded-lg px-3 py-2 [color-scheme:dark]" /></div>
                    <div><label className="block text-gray-400 text-sm mb-1">End Date</label><input type="date" value={newEdu.end_date} onChange={(e) => setNewEdu({...newEdu, end_date: e.target.value})} className="w-full bg-[#141414] border border-gray-800 rounded-lg px-3 py-2 [color-scheme:dark]" /></div>
                  </div>
                  <button type="submit" disabled={saving} className="bg-white text-black font-medium px-6 py-2 rounded-lg">Add Education</button>
                </form>
                <div className="space-y-4">{education.map(edu => (<div key={edu.id} className="bg-[#141414] p-4 rounded-xl border border-gray-800 flex justify-between"><div className="w-full"><h4 className="font-bold">{edu.degree} {edu.field_of_study && `in ${edu.field_of_study}`}</h4><p className="text-gray-400">{edu.institution}</p></div><button onClick={() => handleDeleteEducation(edu.id)} className="text-red-500 text-sm hover:underline ml-4">Delete</button></div>))}</div>
              </div>
            )}

            {activeTab === 'certifications' && (
              <div>
                <h2 className="text-xl font-medium mb-6">Manage Certifications</h2>
                <form onSubmit={handleAddCertification} className="grid grid-cols-2 gap-4 mb-8 bg-[#0a0a0a] p-4 rounded-xl border border-gray-800">
                  <div><label className="block text-gray-400 text-sm mb-1">Name</label><input type="text" required value={newCert.name} onChange={(e) => setNewCert({...newCert, name: e.target.value})} className="w-full bg-[#141414] border border-gray-800 rounded-lg px-3 py-2" /></div>
                  <div><label className="block text-gray-400 text-sm mb-1">Issuer</label><input type="text" value={newCert.issuer} onChange={(e) => setNewCert({...newCert, issuer: e.target.value})} className="w-full bg-[#141414] border border-gray-800 rounded-lg px-3 py-2" /></div>
                  <div><label className="block text-gray-400 text-sm mb-1">Issue Date</label><input type="date" value={newCert.issue_date} onChange={(e) => setNewCert({...newCert, issue_date: e.target.value})} className="w-full bg-[#141414] border border-gray-800 rounded-lg px-3 py-2 [color-scheme:dark]" /></div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Status (Optional)</label>
                    <select value={newCert.status} onChange={(e) => setNewCert({...newCert, status: e.target.value})} className="w-full bg-[#141414] border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-gray-500">
                      <option value="">Select Status...</option><option value="Completed">Completed</option><option value="In progress">In progress</option>
                    </select>
                  </div>
                  <div className="col-span-2 mt-2"><button type="submit" disabled={saving} className="bg-white text-black font-medium px-6 py-2 rounded-lg">Add</button></div>
                </form>
                <div className="space-y-3">{certifications.map(cert => (<div key={cert.id} className="bg-[#141414] p-4 rounded-xl border border-gray-800 flex justify-between"><div><span className="font-medium block">{cert.name}</span><span className="text-gray-500 text-sm">{cert.issuer}</span></div><button onClick={() => handleDeleteCertification(cert.id)} className="text-red-500 text-sm hover:underline ml-4">Delete</button></div>))}</div>
              </div>
            )}

            {activeTab === 'resume' && (
              <div>
                <h2 className="text-xl font-medium mb-2 text-blue-400">Build Your Resume</h2>
                <p className="text-gray-400 mb-8 text-sm">Select exactly what you want on your PDF.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Experience</h3>
                    <div className="space-y-3">{experiences.map((exp) => (<label key={exp.id} className="flex items-center gap-4 bg-[#0a0a0a] p-4 rounded-xl border border-gray-800 cursor-pointer"><input type="checkbox" checked={resumeExps.includes(exp.id)} onChange={() => toggleResumeExp(exp.id)} className="w-5 h-5 accent-blue-500" /><div><span className="font-medium block leading-tight">{exp.position}</span><span className="text-gray-500 text-xs">{exp.company}</span></div></label>))}</div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Projects</h3>
                    <div className="space-y-3">{projects.map((project) => (<label key={project.id} className="flex items-center gap-4 bg-[#0a0a0a] p-4 rounded-xl border border-gray-800 cursor-pointer"><input type="checkbox" checked={resumeProjects.includes(project.id)} onChange={() => toggleResumeProject(project.id)} className="w-5 h-5 accent-blue-500" /><div><span className="font-medium block leading-tight">{project.title}</span><span className="text-gray-500 text-xs">{project.role}</span></div></label>))}</div>
                  </div>
                  {/* NEW: Skills checklist inside Resume Builder */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Skills</h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">{skills.map((skill) => (<label key={skill.id} className="flex items-center gap-4 bg-[#0a0a0a] p-4 rounded-xl border border-gray-800 cursor-pointer"><input type="checkbox" checked={resumeSkills.includes(skill.id)} onChange={() => toggleResumeSkill(skill.id)} className="w-5 h-5 accent-blue-500" /><div><span className="font-medium block leading-tight">{skill.name}</span><span className="text-gray-500 text-xs">{skill.category}</span></div></label>))}</div>
                  </div>
                </div>
                <button onClick={generatePDF} disabled={isGeneratingPDF} className="w-full bg-blue-600 text-white font-medium px-8 py-3 rounded-xl mt-8">{isGeneratingPDF ? 'Generating your PDF...' : 'Download PDF Resume'}</button>
              </div>
            )}

          </div>
        </div>
      </div>
      
      {/* INVISIBLE PRINTABLE RESUME */}
      <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
        <div id="resume-pdf-content" className="w-[800px] bg-white text-black p-10 font-sans">
          <div className="border-b-2 border-black pb-6 mb-6 flex items-center gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
              <img src={profileData.avatar_url || placeholderImage} alt="Profile" className="w-full h-full object-cover p-2" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2 uppercase tracking-tight text-left">{profileData.name}</h1>
              <div className="flex gap-4 text-sm text-gray-700 font-medium">
                <span>{profileData.email}</span><span>•</span><span>{profileData.phone}</span><span>•</span><span>{profileData.location}</span>
              </div>
            </div>
          </div>

          <div className="mb-6"><p className="text-sm leading-relaxed">{profileData.bio}</p></div>

          {/* NEW: Technical Skills rendered efficiently on the PDF */}
          {skills.filter(s => resumeSkills.includes(s.id)).length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3 uppercase tracking-wider text-gray-900">Technical Skills</h2>
              <div className="text-sm text-gray-800 space-y-1.5">
                {Object.entries(
                  skills.filter(s => resumeSkills.includes(s.id)).reduce((acc, skill) => {
                    if (!acc[skill.category]) acc[skill.category] = [];
                    acc[skill.category].push(skill.name);
                    return acc;
                  }, {})
                ).map(([category, skillNames]) => (
                  <div key={category}>
                    <span className="font-bold text-black">{category}: </span>
                    <span>{skillNames.join(', ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {experiences.filter(e => resumeExps.includes(e.id)).length > 0 && (
            <>
              <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-4 uppercase tracking-wider text-gray-900">Professional Experience</h2>
              <div className="space-y-5">
                {experiences.filter(e => resumeExps.includes(e.id)).map(exp => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-base text-black">{exp.position}</h3>
                      <span className="text-sm font-bold text-gray-600">{exp.start_date ? exp.start_date.substring(0, 4) : ''} - {exp.is_current ? 'Present' : (exp.end_date ? exp.end_date.substring(0, 4) : '')}</span>
                    </div>
                    <p className="text-sm font-medium mb-2 text-gray-800">{exp.company}</p>
                    {exp.bullets && exp.bullets.length > 0 && (
                      <ul className="list-disc pl-5 text-sm space-y-1 text-gray-700">
                        {exp.bullets.map((bullet, i) => (
                          <li key={i}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {projects.filter(p => resumeProjects.includes(p.id)).length > 0 && (
            <>
              <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-4 uppercase tracking-wider text-gray-900 mt-6">Technical Projects</h2>
              <div className="space-y-5">
                {projects.filter(p => resumeProjects.includes(p.id)).map((project) => (
                  <div key={project.id}>
                    <div className="flex justify-between items-baseline mb-2">
                      <h3 className="font-bold text-base text-black">{project.title}</h3>
                      <span className="text-sm font-bold text-gray-600">{project.role || 'Project Manager'}</span>
                    </div>
                    {project.highlights && project.highlights.length > 0 && (
                      <ul className="list-disc pl-5 text-sm space-y-1 text-gray-700">
                        {project.highlights.map((highlight, index) => <li key={index}>{highlight}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
          
          <div className="grid grid-cols-2 gap-8 mt-6">
            {education.length > 0 && (
              <div>
                <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-4 uppercase tracking-wider text-gray-900">Education</h2>
                {education.map(edu => (
                  <div key={edu.id} className="mb-4">
                    <h3 className="font-bold text-black text-sm">{edu.degree} {edu.field_of_study && `in ${edu.field_of_study}`}</h3>
                    <p className="text-sm text-gray-800">{edu.institution}</p>
                    <p className="text-xs text-gray-500">{edu.end_date ? `Expected ${edu.end_date.substring(0, 4)}` : (edu.start_date ? edu.start_date.substring(0, 4) : '')}</p>
                  </div>
                ))}
              </div>
            )}
            
            {certifications.filter(c => resumeCerts.includes(c.id)).length > 0 && (
              <div>
                <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-4 uppercase tracking-wider text-gray-900">Certifications</h2>
                <ul className="list-disc pl-5 text-sm space-y-2 text-gray-700">
                  {certifications.filter(c => resumeCerts.includes(c.id)).map(cert => (
                    <li key={cert.id}><strong>{cert.name}</strong> — {cert.issuer} {cert.issue_date && `(${cert.issue_date.substring(0, 4)})`}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}