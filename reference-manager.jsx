const { useState, useEffect } = React;

const ReferenceManager = () => {
  const [references, setReferences] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterTag, setFilterTag] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState(new Set());
  const [citationStyle, setCitationStyle] = useState('apa');
  
  // Password protection
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  
  // Google Drive integration
  const [isGoogleDriveReady, setIsGoogleDriveReady] = useState(false);
  const [driveAccessToken, setDriveAccessToken] = useState(null);
  const [uploadingPDF, setUploadingPDF] = useState(false);
  
  // Set your password here - change this to whatever you want
  const APP_PASSWORD = 'ARC2024';
  
  // ============================================================================
  // GOOGLE DRIVE CREDENTIALS - FOLLOW THESE STEPS:
  // ============================================================================
  // 
  // STEP 1: Copy your Client ID from Google Cloud Console
  // STEP 2: Paste it between the quotes below (replace PASTE_YOUR_CLIENT_ID_HERE)
  // STEP 3: Copy your API Key from Google Cloud Console  
  // STEP 4: Paste it between the quotes below (replace PASTE_YOUR_API_KEY_HERE)
  //
  // Example of what it should look like when done:
  // const GOOGLE_CLIENT_ID = '123456789-abc123xyz.apps.googleusercontent.com';
  // const GOOGLE_API_KEY = 'AIzaSyAbc123XYZ-YourActualAPIKey';
  //
  // IMPORTANT: Keep the quotes around your credentials!
  // ============================================================================
  
  const GOOGLE_CLIENT_ID = '489777596410-0lbnt277femoo3oki4rirfmltkir8vcl.apps.googleusercontent.com';
  const GOOGLE_API_KEY = 'AIzaSyDB_SAZi0xd4_Th7QSD1qteKYaEOLWXeng';
  
  // ============================================================================
  // DO NOT EDIT BELOW THIS LINE
  // ============================================================================
  const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
  const SCOPES = 'https://www.googleapis.com/auth/drive.file';
  
  // Check if already authenticated in session
  useEffect(() => {
    const authStatus = sessionStorage.getItem('arc_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);
  
  // Load Google API
  useEffect(() => {
    if (isAuthenticated) {
      loadGoogleDriveAPI();
    }
  }, [isAuthenticated]);
  
  const loadGoogleDriveAPI = () => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      window.gapi.load('client:auth2', initGoogleDrive);
    };
    document.body.appendChild(script);
  };
  
  const initGoogleDrive = async () => {
    try {
      await window.gapi.client.init({
        apiKey: GOOGLE_API_KEY,
        clientId: GOOGLE_CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      });
      
      // Check if already signed in
      const authInstance = window.gapi.auth2.getAuthInstance();
      if (authInstance.isSignedIn.get()) {
        setIsGoogleDriveReady(true);
        setDriveAccessToken(authInstance.currentUser.get().getAuthResponse().access_token);
      }
    } catch (error) {
      console.error('Error initializing Google Drive:', error);
    }
  };
  
  const signInToGoogleDrive = async () => {
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signIn();
      setIsGoogleDriveReady(true);
      setDriveAccessToken(authInstance.currentUser.get().getAuthResponse().access_token);
    } catch (error) {
      console.error('Error signing in to Google Drive:', error);
      alert('Failed to connect to Google Drive. Please try again.');
    }
  };
  
  const uploadPDFToGoogleDrive = async (file) => {
    if (!isGoogleDriveReady) {
      alert('Please connect to Google Drive first');
      return null;
    }
    
    setUploadingPDF(true);
    
    try {
      // Create "ARC References" folder if it doesn't exist
      const folderId = await getOrCreateARCFolder();
      
      // Upload the file
      const metadata = {
        name: file.name,
        mimeType: file.type,
        parents: [folderId]
      };
      
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);
      
      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: new Headers({ 'Authorization': 'Bearer ' + driveAccessToken }),
        body: form,
      });
      
      const result = await response.json();
      setUploadingPDF(false);
      
      return {
        driveFileId: result.id,
        driveFileName: result.name,
        driveFileUrl: `https://drive.google.com/file/d/${result.id}/view`
      };
    } catch (error) {
      console.error('Error uploading to Google Drive:', error);
      setUploadingPDF(false);
      alert('Failed to upload PDF to Google Drive. Please try again.');
      return null;
    }
  };
  
  const getOrCreateARCFolder = async () => {
    try {
      // Search for existing ARC References folder
      const searchResponse = await window.gapi.client.drive.files.list({
        q: "name='ARC References' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields: 'files(id, name)',
      });
      
      if (searchResponse.result.files && searchResponse.result.files.length > 0) {
        return searchResponse.result.files[0].id;
      }
      
      // Create folder if it doesn't exist
      const folderMetadata = {
        name: 'ARC References',
        mimeType: 'application/vnd.google-apps.folder'
      };
      
      const createResponse = await window.gapi.client.drive.files.create({
        resource: folderMetadata,
        fields: 'id'
      });
      
      return createResponse.result.id;
    } catch (error) {
      console.error('Error with ARC folder:', error);
      throw error;
    }
  };
  
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === APP_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('arc_authenticated', 'true');
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setPasswordInput('');
    }
  };
  
  const [formData, setFormData] = useState({
    type: 'article',
    title: '',
    authors: '',
    year: '',
    journal: '',
    volume: '',
    issue: '',
    pages: '',
    doi: '',
    publisher: '',
    tags: '',
    notes: '',
    pdfFile: null
  });

  // Load references from storage on mount
  useEffect(() => {
    loadReferences();
  }, []);

  const loadReferences = async () => {
    try {
      const result = await window.storage.list('ref:');
      if (result && result.keys) {
        const loadedRefs = await Promise.all(
          result.keys.map(async (key) => {
            try {
              const data = await window.storage.get(key);
              return data ? JSON.parse(data.value) : null;
            } catch {
              return null;
            }
          })
        );
        
        const validRefs = loadedRefs.filter(ref => ref !== null);
        setReferences(validRefs);
        
        // Extract all unique tags
        const tags = new Set();
        validRefs.forEach(ref => {
          if (ref.tags) {
            ref.tags.split(',').forEach(tag => tags.add(tag.trim()));
          }
        });
        setAllTags(tags);
      }
    } catch (error) {
      console.log('No existing references found, starting fresh');
    }
    setLoading(false);
  };

  const saveReference = async (reference) => {
    try {
      await window.storage.set(`ref:${reference.id}`, JSON.stringify(reference));
    } catch (error) {
      console.error('Failed to save reference:', error);
      alert('Failed to save reference. Please try again.');
    }
  };

  const deleteReference = async (id) => {
    try {
      await window.storage.delete(`ref:${id}`);
      setReferences(references.filter(ref => ref.id !== id));
    } catch (error) {
      console.error('Failed to delete reference:', error);
      alert('Failed to delete reference. Please try again.');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      // First, extract metadata from PDF
      try {
        const arrayBuffer = await file.arrayBuffer();
        const text = await extractPDFText(arrayBuffer);
        const metadata = extractMetadata(text);
        
        setFormData(prev => ({
          ...prev,
          pdfFile: file,
          title: metadata.title || prev.title,
          authors: metadata.authors || prev.authors,
          year: metadata.year || prev.year,
          doi: metadata.doi || prev.doi
        }));
        
        // Upload to Google Drive if connected
        if (isGoogleDriveReady) {
          const driveData = await uploadPDFToGoogleDrive(file);
          if (driveData) {
            setFormData(prev => ({
              ...prev,
              driveFileId: driveData.driveFileId,
              driveFileName: driveData.driveFileName,
              driveFileUrl: driveData.driveFileUrl
            }));
          }
        }
      } catch (error) {
        console.error('Error processing PDF:', error);
        setFormData(prev => ({ ...prev, pdfFile: file }));
      }
    }
  };

  const extractPDFText = async (arrayBuffer) => {
    // Simple text extraction - in production, you'd use a proper PDF library
    const decoder = new TextDecoder();
    return decoder.decode(arrayBuffer);
  };

  const extractMetadata = (text) => {
    const metadata = {};
    
    // Try to extract DOI
    const doiMatch = text.match(/10\.\d{4,}\/[^\s]+/);
    if (doiMatch) metadata.doi = doiMatch[0];
    
    // Try to extract year
    const yearMatch = text.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) metadata.year = yearMatch[0];
    
    return metadata;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newReference = {
      id: editingId || `ref_${Date.now()}`,
      ...formData,
      pdfFile: formData.pdfFile ? formData.pdfFile.name : null,
      dateAdded: editingId ? references.find(r => r.id === editingId)?.dateAdded : new Date().toISOString()
    };

    if (editingId) {
      const updatedRefs = references.map(ref => 
        ref.id === editingId ? newReference : ref
      );
      setReferences(updatedRefs);
    } else {
      setReferences([...references, newReference]);
    }

    await saveReference(newReference);
    
    // Update tags
    if (newReference.tags) {
      const newTags = new Set(allTags);
      newReference.tags.split(',').forEach(tag => newTags.add(tag.trim()));
      setAllTags(newTags);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      type: 'article',
      title: '',
      authors: '',
      year: '',
      journal: '',
      volume: '',
      issue: '',
      pages: '',
      doi: '',
      publisher: '',
      tags: '',
      notes: '',
      pdfFile: null,
      driveFileId: null,
      driveFileName: null,
      driveFileUrl: null
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  const startEdit = (ref) => {
    setFormData({ ...ref, pdfFile: null });
    setEditingId(ref.id);
    setShowAddForm(true);
  };

  const generateCitation = (ref, style = 'apa') => {
    const authors = ref.authors || 'Unknown';
    const year = ref.year || 'n.d.';
    const title = ref.title || 'Untitled';
    
    if (style === 'apa') {
      if (ref.type === 'article') {
        const journal = ref.journal || '';
        const volume = ref.volume ? `, ${ref.volume}` : '';
        const issue = ref.issue ? `(${ref.issue})` : '';
        const pages = ref.pages ? `, ${ref.pages}` : '';
        const doi = ref.doi ? `. https://doi.org/${ref.doi}` : '';
        
        return `${authors} (${year}). ${title}. <em>${journal}</em>${volume}${issue}${pages}${doi}`;
      } else if (ref.type === 'book') {
        const publisher = ref.publisher || '';
        return `${authors} (${year}). <em>${title}</em>. ${publisher}`;
      } else {
        return `${authors} (${year}). ${title}`;
      }
    } 
    else if (style === 'mla') {
      if (ref.type === 'article') {
        const journal = ref.journal ? `<em>${ref.journal}</em>` : '';
        const volume = ref.volume ? `, vol. ${ref.volume}` : '';
        const issue = ref.issue ? `, no. ${ref.issue}` : '';
        const year = ref.year ? `, ${ref.year}` : '';
        const pages = ref.pages ? `, pp. ${ref.pages}` : '';
        const doi = ref.doi ? `. DOI: ${ref.doi}` : '';
        
        return `${authors}. "${title}." ${journal}${volume}${issue}${year}${pages}${doi}`;
      } else if (ref.type === 'book') {
        const publisher = ref.publisher || '';
        const year = ref.year ? `, ${ref.year}` : '';
        return `${authors}. <em>${title}</em>. ${publisher}${year}.`;
      } else {
        return `${authors}. "${title}." ${year}.`;
      }
    }
    else if (style === 'chicago') {
      if (ref.type === 'article') {
        const journal = ref.journal ? `<em>${ref.journal}</em>` : '';
        const volume = ref.volume || '';
        const issue = ref.issue ? `, no. ${ref.issue}` : '';
        const year = ref.year ? ` (${ref.year})` : '';
        const pages = ref.pages ? `: ${ref.pages}` : '';
        const doi = ref.doi ? `. https://doi.org/${ref.doi}` : '';
        
        return `${authors}. "${title}." ${journal} ${volume}${issue}${year}${pages}${doi}`;
      } else if (ref.type === 'book') {
        const publisher = ref.publisher || '';
        const year = ref.year ? `, ${ref.year}` : '';
        return `${authors}. <em>${title}</em>. ${publisher}${year}.`;
      } else {
        return `${authors}. "${title}." ${year}.`;
      }
    }
    else if (style === 'harvard') {
      if (ref.type === 'article') {
        const journal = ref.journal ? `<em>${ref.journal}</em>` : '';
        const volume = ref.volume ? `, ${ref.volume}` : '';
        const issue = ref.issue ? `(${ref.issue})` : '';
        const pages = ref.pages ? `, pp.${ref.pages}` : '';
        const doi = ref.doi ? ` doi:${ref.doi}` : '';
        
        return `${authors} (${year}) '${title}', ${journal}${volume}${issue}${pages}${doi}`;
      } else if (ref.type === 'book') {
        const publisher = ref.publisher || '';
        return `${authors} (${year}) <em>${title}</em>. ${publisher}.`;
      } else {
        return `${authors} (${year}) '${title}'.`;
      }
    }
    else if (style === 'vancouver') {
      if (ref.type === 'article') {
        const journal = ref.journal || '';
        const year = ref.year ? `${ref.year}` : '';
        const volume = ref.volume ? `;${ref.volume}` : '';
        const issue = ref.issue ? `(${ref.issue})` : '';
        const pages = ref.pages ? `:${ref.pages}` : '';
        const doi = ref.doi ? `. doi:${ref.doi}` : '';
        
        return `${authors}. ${title}. ${journal}. ${year}${volume}${issue}${pages}${doi}`;
      } else if (ref.type === 'book') {
        const publisher = ref.publisher || '';
        const year = ref.year ? `; ${ref.year}` : '';
        return `${authors}. ${title}. ${publisher}${year}.`;
      } else {
        return `${authors}. ${title}. ${year}.`;
      }
    }
    
    return '';
  };

  const exportReferences = () => {
    const citations = filteredReferences.map(ref => {
      const citation = generateCitation(ref, citationStyle);
      // Remove HTML tags for plain text export
      return citation.replace(/<\/?em>/g, '');
    }).join('\n\n');
    
    const blob = new Blob([citations], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `references-${citationStyle}.txt`;
    a.click();
  };

  const filteredReferences = references.filter(ref => {
    const matchesSearch = !searchTerm || 
      ref.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.authors?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.journal?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || ref.type === filterType;
    
    const matchesTag = !filterTag || ref.tags?.toLowerCase().includes(filterTag.toLowerCase());
    
    return matchesSearch && matchesType && matchesTag;
  });

  // Password screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" 
           style={{ 
             background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
             fontFamily: "'Crimson Text', serif"
           }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&family=Cinzel:wght@600;700&display=swap');
          
          .password-input {
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid rgba(245, 158, 11, 0.3);
            transition: all 0.3s ease;
          }
          
          .password-input:focus {
            outline: none;
            border-color: #f59e0b;
            background: rgba(255, 255, 255, 0.08);
            box-shadow: 0 0 30px rgba(245, 158, 11, 0.2);
          }
          
          .password-input.error {
            border-color: #ef4444;
            animation: shake 0.5s;
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
          }
          
          .unlock-btn {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            transition: all 0.3s ease;
          }
          
          .unlock-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 10px 40px rgba(245, 158, 11, 0.4);
          }
          
          .lock-icon {
            animation: fadeIn 1s ease;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
        
        <div className="max-w-md w-full">
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-12 border border-amber-500 border-opacity-20 shadow-2xl">
            {/* Lock Icon */}
            <div className="flex justify-center mb-8 lock-icon">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-400 opacity-20 blur-xl rounded-full"></div>
                <svg className="w-20 h-20 text-amber-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-4xl font-bold text-amber-100 text-center mb-3" 
                style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.05em' }}>
              Academic Reference<br/>Catalogue
            </h1>
            <p className="text-amber-200 text-center mb-8 opacity-80">
              Protected Access
            </p>
            
            {/* Password Form */}
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-6">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError(false);
                  }}
                  placeholder="Enter password"
                  className={`w-full px-6 py-4 rounded-lg text-amber-100 text-lg text-center placeholder-amber-300 placeholder-opacity-50 password-input ${passwordError ? 'error' : ''}`}
                  autoFocus
                />
                {passwordError && (
                  <p className="text-red-400 text-sm text-center mt-3 font-semibold">
                    ✗ Incorrect password. Please try again.
                  </p>
                )}
              </div>
              
              <button
                type="submit"
                className="w-full unlock-btn px-6 py-4 rounded-lg text-white font-bold text-lg"
              >
                Unlock Catalogue
              </button>
            </form>
            
            {/* Footer Note */}
            <div className="mt-8 pt-6 border-t border-amber-500 border-opacity-20">
              <p className="text-amber-300 text-xs text-center opacity-60">
                Your references and data are stored securely in your browser
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" 
           style={{ 
             background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
             fontFamily: "'Crimson Text', serif"
           }}>
        <div className="text-amber-200 text-2xl">Loading catalogue...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" 
         style={{ 
           background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
           fontFamily: "'Crimson Text', serif"
         }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&family=Cinzel:wght@600;700&display=swap');
        
        .reference-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .reference-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }
        
        .form-input {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(245, 158, 11, 0.2);
          transition: all 0.3s ease;
        }
        
        .form-input:focus {
          outline: none;
          border-color: #f59e0b;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.1);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 30px rgba(245, 158, 11, 0.3);
        }
        
        .tag-pill {
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-6xl font-bold text-amber-100 mb-4" 
                style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.05em' }}>
              Academic Reference Catalogue
            </h1>
            <p className="text-xl text-amber-200 opacity-80">
              Organize and manage your research collection
            </p>
          </div>
          
          <div className="mt-4">
            {!isGoogleDriveReady ? (
              <button
                onClick={signInToGoogleDrive}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-gray-800 font-semibold hover:bg-gray-100 transition-all shadow-lg"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Connect Google Drive
              </button>
            ) : (
              <div className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 bg-opacity-20 border border-green-500 border-opacity-30">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-300 font-semibold">Google Drive Connected</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="max-w-7xl mx-auto mb-8 bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6 border border-amber-500 border-opacity-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-300" size={20} />
            <input
              type="text"
              placeholder="Search by title, author, or journal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg form-input text-amber-100 placeholder-amber-300 placeholder-opacity-50"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 rounded-lg form-input text-amber-100"
          >
            <option value="all">All Types</option>
            <option value="article">Journal Articles</option>
            <option value="book">Books</option>
            <option value="report">Reports</option>
            <option value="other">Other</option>
          </select>
          
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="px-4 py-3 rounded-lg form-input text-amber-100"
          >
            <option value="">All Tags</option>
            {Array.from(allTags).map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
        
        <div className="mt-4 flex gap-4">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary px-6 py-3 rounded-lg text-white font-semibold flex items-center gap-2"
          >
            <Plus size={20} />
            Add New Reference
          </button>
          
          <select
            value={citationStyle}
            onChange={(e) => setCitationStyle(e.target.value)}
            className="px-4 py-3 rounded-lg form-input text-amber-100"
          >
            <option value="apa">APA Style</option>
            <option value="mla">MLA Style</option>
            <option value="chicago">Chicago Style</option>
            <option value="harvard">Harvard Style</option>
            <option value="vancouver">Vancouver Style</option>
          </select>
          
          <button
            onClick={exportReferences}
            className="px-6 py-3 rounded-lg bg-white bg-opacity-10 text-amber-100 font-semibold flex items-center gap-2 hover:bg-opacity-20 transition-all"
          >
            <Download size={20} />
            Export Citations
          </button>
          
          <div className="ml-auto text-amber-200 self-center">
            {filteredReferences.length} of {references.length} references
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="max-w-7xl mx-auto mb-8 bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 border border-amber-500 border-opacity-30">
          <h2 className="text-3xl font-bold text-amber-100 mb-6" style={{ fontFamily: "'Cinzel', serif" }}>
            {editingId ? 'Edit Reference' : 'Add New Reference'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-amber-200 mb-2 font-semibold">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg form-input text-amber-100"
                >
                  <option value="article">Journal Article</option>
                  <option value="book">Book</option>
                  <option value="report">Report</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-amber-200 mb-2 font-semibold">
                  Upload PDF {isGoogleDriveReady && '(Auto-saves to Google Drive)'}
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="pdf-upload"
                    disabled={uploadingPDF}
                  />
                  <label
                    htmlFor="pdf-upload"
                    className={`flex items-center justify-center gap-3 w-full px-4 py-3 rounded-lg form-input text-amber-100 ${uploadingPDF ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-opacity-10'} transition-all border-2 border-dashed`}
                    style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}
                  >
                    {uploadingPDF ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Uploading to Google Drive...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={20} className="text-amber-400" />
                        <span>
                          {formData.driveFileName || formData.pdfFile?.name || 'Click to upload PDF file'}
                        </span>
                        {formData.driveFileUrl && (
                          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </>
                    )}
                  </label>
                </div>
                {!isGoogleDriveReady && (
                  <p className="text-amber-300 text-xs mt-2 opacity-70">
                    Connect Google Drive above to auto-save PDFs to the cloud
                  </p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-amber-200 mb-2 font-semibold">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-lg form-input text-amber-100 placeholder-amber-300 placeholder-opacity-50"
                placeholder="Enter reference title"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-amber-200 mb-2 font-semibold">Authors *</label>
                <input
                  type="text"
                  value={formData.authors}
                  onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-lg form-input text-amber-100 placeholder-amber-300 placeholder-opacity-50"
                  placeholder="Last, F. M., & Last, F. M."
                />
              </div>
              
              <div>
                <label className="block text-amber-200 mb-2 font-semibold">Year</label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg form-input text-amber-100"
                  placeholder="2024"
                />
              </div>
            </div>
            
            {formData.type === 'article' && (
              <>
                <div>
                  <label className="block text-amber-200 mb-2 font-semibold">Journal</label>
                  <input
                    type="text"
                    value={formData.journal}
                    onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg form-input text-amber-100"
                    placeholder="Journal name"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-amber-200 mb-2 font-semibold">Volume</label>
                    <input
                      type="text"
                      value={formData.volume}
                      onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg form-input text-amber-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-amber-200 mb-2 font-semibold">Issue</label>
                    <input
                      type="text"
                      value={formData.issue}
                      onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg form-input text-amber-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-amber-200 mb-2 font-semibold">Pages</label>
                    <input
                      type="text"
                      value={formData.pages}
                      onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg form-input text-amber-100"
                      placeholder="1-10"
                    />
                  </div>
                </div>
              </>
            )}
            
            {formData.type === 'book' && (
              <div>
                <label className="block text-amber-200 mb-2 font-semibold">Publisher</label>
                <input
                  type="text"
                  value={formData.publisher}
                  onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg form-input text-amber-100"
                />
              </div>
            )}
            
            <div>
              <label className="block text-amber-200 mb-2 font-semibold">DOI</label>
              <input
                type="text"
                value={formData.doi}
                onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                className="w-full px-4 py-3 rounded-lg form-input text-amber-100"
                placeholder="10.1234/example"
              />
            </div>
            
            <div>
              <label className="block text-amber-200 mb-2 font-semibold">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-3 rounded-lg form-input text-amber-100"
                placeholder="methodology, neuroscience, review"
              />
            </div>
            
            <div>
              <label className="block text-amber-200 mb-2 font-semibold">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-lg form-input text-amber-100"
                placeholder="Add your notes here..."
              />
            </div>
            
            <div className="flex gap-4">
              <button
                type="submit"
                className="btn-primary px-8 py-3 rounded-lg text-white font-bold"
              >
                {editingId ? 'Update Reference' : 'Add Reference'}
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                className="px-8 py-3 rounded-lg bg-white bg-opacity-10 text-amber-100 font-semibold hover:bg-opacity-20 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* References List */}
      <div className="max-w-7xl mx-auto space-y-6">
        {filteredReferences.length === 0 ? (
          <div className="text-center py-20">
            <Book className="mx-auto mb-4 text-amber-300 opacity-50" size={64} />
            <p className="text-2xl text-amber-200 opacity-70">
              {references.length === 0 
                ? "No references yet. Add your first reference to get started!"
                : "No references match your search criteria."}
            </p>
          </div>
        ) : (
          filteredReferences.map(ref => (
            <div
              key={ref.id}
              className="reference-card bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6 border border-amber-500 border-opacity-20"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {ref.type === 'article' && <FileText className="text-amber-400" size={24} />}
                    {ref.type === 'book' && <Book className="text-amber-400" size={24} />}
                    {ref.type === 'report' && <FileText className="text-amber-400" size={24} />}
                    <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
                          style={{ 
                            background: 'rgba(245, 158, 11, 0.2)',
                            color: '#fbbf24',
                            border: '1px solid rgba(245, 158, 11, 0.3)'
                          }}>
                      {ref.type}
                    </span>
                    {ref.pdfFile && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold"
                            style={{ 
                              background: 'rgba(34, 197, 94, 0.2)',
                              color: '#86efac',
                              border: '1px solid rgba(34, 197, 94, 0.3)'
                            }}>
                        PDF {ref.driveFileUrl ? 'in Drive' : 'Attached'}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-amber-50 mb-2">
                    {ref.title}
                  </h3>
                  
                  <p className="text-lg text-amber-200 mb-2">
                    {ref.authors} {ref.year && `(${ref.year})`}
                  </p>
                  
                  {ref.journal && (
                    <p className="text-amber-300 italic mb-2">
                      {ref.journal}
                      {ref.volume && `, ${ref.volume}`}
                      {ref.issue && `(${ref.issue})`}
                      {ref.pages && `, ${ref.pages}`}
                    </p>
                  )}
                  
                  {ref.publisher && (
                    <p className="text-amber-300 mb-2">{ref.publisher}</p>
                  )}
                  
                  {ref.doi && (
                    <p className="text-amber-400 text-sm mb-2">
                      DOI: {ref.doi}
                    </p>
                  )}
                  
                  {ref.tags && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {ref.tags.split(',').map((tag, idx) => (
                        <span
                          key={idx}
                          className="tag-pill px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ 
                            background: 'rgba(139, 92, 246, 0.2)',
                            color: '#c4b5fd',
                            border: '1px solid rgba(139, 92, 246, 0.3)'
                          }}
                        >
                          <Tag size={12} className="inline mr-1" />
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {ref.notes && (
                    <div className="mt-4 p-4 rounded-lg bg-black bg-opacity-20">
                      <p className="text-amber-100 text-sm italic">{ref.notes}</p>
                    </div>
                  )}
                  
                  {ref.driveFileUrl && (
                    <div className="mt-4">
                      <a
                        href={ref.driveFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 bg-opacity-20 border border-blue-500 border-opacity-30 text-blue-300 hover:bg-opacity-30 transition-all font-semibold"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
                        </svg>
                        View PDF in Google Drive
                      </a>
                    </div>
                  )}
                  
                  <div className="mt-4 p-4 rounded-lg bg-black bg-opacity-30">
                    <p className="text-amber-200 text-sm font-semibold mb-2">
                      {citationStyle.toUpperCase()} Citation:
                    </p>
                    <p 
                      className="text-amber-100 text-sm"
                      dangerouslySetInnerHTML={{ __html: generateCitation(ref, citationStyle) }}
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => startEdit(ref)}
                    className="p-2 rounded-lg bg-white bg-opacity-10 text-amber-300 hover:bg-opacity-20 transition-all"
                    title="Edit"
                  >
                    <Edit2 size={20} />
                  </button>
                  
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this reference?')) {
                        deleteReference(ref.id);
                      }
                    }}
                    className="p-2 rounded-lg bg-white bg-opacity-10 text-red-400 hover:bg-opacity-20 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
