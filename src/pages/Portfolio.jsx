import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const formatUrl = (url) => {
  if (!url) return '#'
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  return url
}

function Portfolio() {
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [skills, setSkills] = useState([])
  const [education, setEducation] = useState([])
  const [certifications, setCertifications] = useState([])
  const [experiences, setExperiences] = useState([])
  const [interests, setInterests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(true)

  // Contact Form States
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  useEffect(() => {
    document.documentElement.classList.add('scroll-smooth')
    
    // Apply theme
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    async function fetchData() {
      const [
        { data: profileData },
        { data: projectsData },
        { data: skillsData },
        { data: eduData },
        { data: certData },
        { data: expData },
        { data: intData }
      ] = await Promise.all([
        supabase.from('profiles').select('*').limit(1).single(),
        supabase.from('projects').select('*').order('id', { ascending: true }),
        supabase.from('skills').select('*').order('id', { ascending: true }),
        supabase.from('education').select('*').order('start_date', { ascending: false }),
        supabase.from('certifications').select('*').order('issue_date', { ascending: false }),
        supabase.from('experience').select('*').order('start_date', { ascending: false }),
        supabase.from('interests').select('*').order('id', { ascending: true })
      ])

      if (profileData) setProfile(profileData)
      if (projectsData) setProjects(projectsData)
      if (skillsData) setSkills(skillsData)
      if (eduData) setEducation(eduData)
      if (certData) setCertifications(certData)
      if (expData) setExperiences(expData)
      if (intData) setInterests(intData)

      setIsLoading(false)
    }

    fetchData()

    return () => document.documentElement.classList.remove('scroll-smooth')
  }, [isDarkMode])

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: "2968c08e-7d9c-4090-8233-8d1098ccc996",
          name: formData.name,
          email: formData.email,
          message: formData.message
        }),
      })
      
      const result = await response.json()
      if (result.success) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', message: '' }) 
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      setSubmitStatus('error')
    }
    
    setIsSubmitting(false)
  }

  if (isLoading) {
    return <div className="min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-white flex items-center justify-center transition-colors duration-300">Loading your portfolio...</div>
  }

  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = []
    acc[skill.category].push(skill)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-gray-900 dark:text-white font-sans selection:bg-black/10 dark:selection:bg-white/20 selection:text-black dark:selection:text-white transition-colors duration-300">
      
      {/* NAVIGATION */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 transition-colors duration-300">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="font-bold text-xl italic text-gray-900 dark:text-white transition-colors duration-300">MyPortfolio.</div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-6 text-sm font-medium text-gray-600 dark:text-gray-400">
              <a href="#about" className="hover:text-black dark:hover:text-white transition-colors">About</a>
              <a href="#experience" className="hover:text-black dark:hover:text-white transition-colors">Experience</a>
              <a href="#projects" className="hover:text-black dark:hover:text-white transition-colors">Projects</a>
              <a href="#contact" className="hover:text-black dark:hover:text-white transition-colors">Contact</a>
            </div>
            
            {/* THEME TOGGLE BUTTON */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="max-w-4xl mx-auto px-6 py-12 md:py-16 flex flex-col items-center text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-2 tracking-tight text-gray-900 dark:text-white transition-colors duration-300">
          I am {profile?.name || 'Benedict Abania'}
        </h1>
        <h2 className="text-xl md:text-2xl font-medium text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-300">
          {profile?.title || 'Computer Science Senior'}
        </h2>
        <p className="max-w-2xl text-gray-500 dark:text-gray-400 text-base md:text-lg leading-relaxed mb-8 transition-colors duration-300">
          {profile?.headline || 'I bridge the gap between technical developers and project goals, translating complex problems into plain language and actionable timelines.'}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="#projects" className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.15)]">
            View My Work
          </a>
          <a href="#contact" className="border border-gray-300 dark:border-white/30 text-gray-900 dark:text-white px-8 py-3 rounded-full font-medium hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            Get In Touch
          </a>
        </div>
      </section>

      {/* ABOUT ME SECTION */}
      <section id="about" className="bg-gray-50 dark:bg-[#0a0a0a] border-y border-gray-200 dark:border-white/5 py-16 md:py-20 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white transition-colors duration-300">About Me</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 whitespace-pre-wrap transition-colors duration-300">
              {profile?.bio || 'Bio details coming soon...'}
            </p>
            
            {interests.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 transition-colors duration-300">Interests & Hobbies</h3>
                <div className="flex flex-wrap gap-2">
                  {interests.map(interest => (
                    <span key={interest.id} className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 px-4 py-1.5 rounded-full text-sm transition-colors duration-300">
                      {interest.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-900 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <img 
                src={profile?.avatar_url || "https://ui-avatars.com/api/?name=C+B&background=ffffff&color=000&size=400"} 
                alt="Profile Avatar" 
                className="relative w-full max-w-[300px] rounded-2xl object-cover shadow-2xl border border-gray-200 dark:border-white/10 transition-colors duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SKILLS SECTION */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-20">
        <h2 className="text-3xl font-bold mb-8 text-center md:text-left text-gray-900 dark:text-white transition-colors duration-300">Skills & Technologies</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.keys(skillsByCategory).length === 0 ? (
            <p className="text-gray-500 italic">Skills coming soon...</p>
          ) : (
            Object.keys(skillsByCategory).map((category) => (
              <div key={category} className="bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/10 p-6 rounded-2xl shadow-lg transition-colors duration-300">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white transition-colors duration-300">{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {skillsByCategory[category].map(skill => (
                    <span key={skill.id} className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* TIMELINES: 3-COLUMN LAYOUT */}
      <section id="experience" className="bg-gray-50 dark:bg-[#0a0a0a] border-y border-gray-200 dark:border-white/5 py-16 md:py-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
            
            {/* COLUMN 1: EXPERIENCE */}
            <div>
              <h2 className="text-3xl font-bold mb-10 text-center text-gray-900 dark:text-white transition-colors duration-300">Experience</h2>
              
              {experiences.length === 0 ? (
                <p className="text-center text-gray-500 italic">Experience coming soon...</p>
              ) : (
                <div className="relative border-l-2 border-gray-200 dark:border-gray-800 ml-4 md:ml-6 space-y-8 transition-colors duration-300">
                  {experiences.map((exp) => {
                    const year = exp.start_date ? exp.start_date.substring(0, 4) : 'Now';
                    return (
                      <div key={exp.id} className="relative pl-8 md:pl-10">
                        <div className="absolute -left-[25px] top-1 bg-black dark:bg-white border-4 border-gray-50 dark:border-[#0a0a0a] text-white dark:text-black w-12 h-12 flex items-center justify-center rounded-full text-xs font-bold shadow-lg transition-colors duration-300">
                          {year}
                        </div>
                        <div className="bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/10 p-6 rounded-2xl shadow-lg hover:border-gray-300 dark:hover:border-gray-600/50 transition-colors duration-300">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-300">{exp.position}</h3>
                          <p className="text-gray-600 dark:text-gray-300 font-medium text-sm mb-4 transition-colors duration-300">
                            at {exp.company}
                            <span className="text-gray-400 dark:text-gray-500 ml-2 font-normal">
                              ({exp.start_date ? exp.start_date.substring(0, 4) : ''} - {exp.is_current ? 'Present' : (exp.end_date ? exp.end_date.substring(0, 4) : 'Present')})
                            </span>
                          </p>
                          {exp.bullets && exp.bullets.length > 0 && (
                            <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-2 list-disc pl-4 leading-relaxed transition-colors duration-300">
                              {exp.bullets.map((bullet, i) => (
                                <li key={i}>{bullet}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* COLUMN 2: EDUCATION */}
            <div>
              <h2 className="text-3xl font-bold mb-10 text-center text-gray-900 dark:text-white transition-colors duration-300">Education</h2>
              
              {education.length === 0 ? (
                <p className="text-center text-gray-500 italic">Education coming soon...</p>
              ) : (
                <div className="relative border-l-2 border-gray-200 dark:border-gray-800 ml-4 md:ml-6 space-y-8 transition-colors duration-300">
                  {education.map((edu) => {
                    const year = edu.end_date ? edu.end_date.substring(0, 4) : (edu.start_date ? edu.start_date.substring(0, 4) : 'Now');
                    return (
                      <div key={edu.id} className="relative pl-8 md:pl-10">
                        <div className="absolute -left-[25px] top-1 bg-black dark:bg-white border-4 border-gray-50 dark:border-[#0a0a0a] text-white dark:text-black w-12 h-12 flex items-center justify-center rounded-full text-xs font-bold shadow-lg transition-colors duration-300">
                          {year}
                        </div>
                        <div className="bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/10 p-6 rounded-2xl shadow-lg hover:border-gray-300 dark:hover:border-gray-600/50 transition-colors duration-300">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-300">{edu.degree}</h3>
                          <p className="text-gray-600 dark:text-gray-300 font-medium text-sm mb-2 transition-colors duration-300">
                            {edu.field_of_study ? `in ${edu.field_of_study} at ` : 'at '}{edu.institution}
                            <span className="text-gray-400 dark:text-gray-500 ml-2 font-normal block mt-1">
                              ({edu.start_date ? edu.start_date.substring(0, 4) : ''} - {edu.end_date ? edu.end_date.substring(0, 4) : 'Present'})
                            </span>
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* COLUMN 3: CERTIFICATIONS */}
            <div>
              <h2 className="text-3xl font-bold mb-10 text-center text-gray-900 dark:text-white transition-colors duration-300">Certifications</h2>
              
              {certifications.length === 0 ? (
                <p className="text-center text-gray-500 italic">Certifications coming soon...</p>
              ) : (
                <div className="space-y-6">
                  {certifications.map(cert => (
                    <div key={cert.id} className="bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/10 p-6 rounded-2xl shadow-lg hover:border-gray-300 dark:hover:border-gray-600/50 transition-colors duration-300 flex flex-col h-full">
                      <div className="flex items-start gap-4 mb-4">
                        {cert.image_url ? (
                          <img src={cert.image_url} alt={cert.issuer} className="w-12 h-12 object-contain bg-white rounded p-1 flex-shrink-0 border border-gray-100 dark:border-none" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center flex-shrink-0 text-gray-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
                          </div>
                        )}
                        <div className="w-full">
                          
                          {/* UPDATED: Title and Status Badge */}
                          <div className="flex items-start justify-between gap-2 mb-1 w-full">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight transition-colors duration-300">{cert.name}</h3>
                            {cert.status && (
                              <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full flex-shrink-0 transition-colors duration-300 ${
                                cert.status === 'Completed' 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              }`}>
                                {cert.status}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium transition-colors duration-300">{cert.issuer}</p>
                        </div>
                      </div>
                      
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <p className="text-gray-400 dark:text-gray-500 text-xs transition-colors duration-300">
                          {cert.issue_date ? `Issued ${cert.issue_date.substring(0, 4)}` : ''}
                        </p>
                        {cert.link_url && (
                          <a href={formatUrl(cert.link_url)} target="_blank" rel="noreferrer" className="text-xs border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white px-3 py-1.5 rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:hover:border-white transition-all">
                            View Credential
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* PROJECTS SECTION */}
      <section id="projects" className="max-w-6xl mx-auto px-6 py-16 md:py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white transition-colors duration-300">My Projects</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto transition-colors duration-300">
            A collection of projects I've organized, managed, and executed.
          </p>
        </div>

        {projects.length === 0 ? (
          <p className="text-center text-gray-500 italic">Projects coming soon...</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-lg hover:shadow-[0_0_30px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all duration-300">
                
                {project.image_url ? (
                  <div className="h-44 w-full border-b border-gray-200 dark:border-white/10 overflow-hidden transition-colors duration-300">
                    <img 
                      src={project.image_url} 
                      alt={project.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800/40 dark:to-[#050505] border-b border-gray-200 dark:border-white/10 relative overflow-hidden transition-colors duration-300">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_120%,#000000,transparent)] dark:bg-[radial-gradient(circle_at_50%_120%,#ffffff,transparent)]"></div>
                  </div>
                )}

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">{project.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-4 uppercase tracking-wider transition-colors duration-300">{project.role || project.category}</p>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 flex-grow line-clamp-3 transition-colors duration-300">
                    {project.goal}
                  </p>
                  
                  <div className="mt-auto">
                    {project.link_url ? (
                      <a href={formatUrl(project.link_url)} target="_blank" rel="noreferrer" className="block w-full text-center bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white py-2.5 rounded-full text-sm font-medium hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:hover:border-white transition-all duration-300">
                        View Details
                      </a>
                    ) : (
                      <button disabled className="block w-full text-center bg-transparent border border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500 py-2.5 rounded-full text-sm font-medium cursor-not-allowed transition-colors duration-300">
                        Internal Project
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CONTACT / FOOTER SECTION */}
      <section id="contact" className="bg-gray-50 dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-white/5 py-16 md:py-20 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-10 text-center text-gray-900 dark:text-white transition-colors duration-300">Let's Work Together</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* FUNCTIONAL CONTACT FORM */}
            <div className="bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/10 p-8 rounded-2xl shadow-lg transition-colors duration-300">
              <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white transition-colors duration-300">Send me a message</h3>
              
              {submitStatus === 'success' ? (
                <div className="bg-green-50 dark:bg-white/10 border border-green-200 dark:border-white/20 text-green-800 dark:text-white p-6 rounded-xl text-center transition-colors duration-300">
                  <h4 className="font-bold mb-2">Message Sent!</h4>
                  <p className="text-sm">Thanks for reaching out. I'll get back to you as soon as possible.</p>
                  <button 
                    onClick={() => setSubmitStatus(null)}
                    className="mt-4 text-xs font-medium border border-green-300 dark:border-white/30 px-4 py-2 rounded-full hover:bg-green-100 dark:hover:bg-white/20 transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleContactSubmit}>
                  {submitStatus === 'error' && (
                    <div className="bg-red-50 dark:bg-white/10 border border-red-200 dark:border-white/20 text-red-800 dark:text-white text-sm p-3 rounded-lg text-center transition-colors duration-300">
                      Something went wrong. Please try again later.
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 transition-colors duration-300">Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 transition-colors duration-300">Email</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 transition-colors duration-300">Message</label>
                    <textarea 
                      rows="4" 
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white resize-none focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300"
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-300 mt-2 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

            <div className="flex flex-col justify-center space-y-8">
              <div className="bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/10 p-8 rounded-2xl shadow-lg flex-grow transition-colors duration-300">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 transition-colors duration-300">
                  I am currently in my senior year of CS, finishing up my thesis and finally running the data on my 30 respondents. If you need a junior project manager to keep your dev team on track, want to collaborate on an app, or just want to grab coffee and talk tech, I would love to hear from you.
                </p>
                <ul className="text-sm text-gray-500 dark:text-gray-300 space-y-2 transition-colors duration-300">
                  <li>• Junior PM opportunities</li>
                  <li>• App and game collaborations</li>
                  <li>• Tech chats over coffee</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/10 p-6 rounded-2xl shadow-lg flex items-center justify-between transition-colors duration-300">
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-300">My Socials</span>
                <div className="flex gap-4">
                  {profile?.linkedin_url && (
                    <a href={formatUrl(profile.linkedin_url)} target="_blank" rel="noreferrer" className="text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    </a>
                  )}
                  {profile?.instagram_url && (
                    <a href={formatUrl(profile.instagram_url)} target="_blank" rel="noreferrer" className="text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    </a>
                  )}
                  {profile?.facebook_url && (
                    <a href={formatUrl(profile.facebook_url)} target="_blank" rel="noreferrer" className="text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-8 text-gray-500 text-sm border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
        <p>© {new Date().getFullYear()} {profile?.name || 'Portfolio'}. All rights reserved.</p>
      </footer>

    </div>
  )
}

export default Portfolio