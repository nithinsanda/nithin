

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import adminApi from "../services/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Presets = () => {
  const [presets, setPresets] = useState({
    myPresets: [],
    sharedPresets: []
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState(null);
  const toastShownRef = useRef(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    file: null,
    filePreview: null,
    images: [],
    imagePreviews: []
  });

  const CATEGORIES = ["Portrait", "Landscape", "Cinematic", "Black & White", "Vintage"];

  useEffect(() => {
    fetchPresets();

    return () => {
      toastShownRef.current = false;
    };
  }, []);

  const fetchPresets = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.presets.getAll();
      
      if (response.data && response.data.success) {
        setPresets({
          myPresets: response.data.presets || [],
          sharedPresets: []
        });
        
        if (!toastShownRef.current) {
          toast.success("Presets loaded successfully");
          toastShownRef.current = true;
        }
      } else {
        throw new Error(response.data?.message || 'Failed to fetch presets');
      }
    } catch (error) {
      console.error("Failed to load presets:", error);
      
      // Set empty array if API fails
      setPresets({
        myPresets: [],
        sharedPresets: []
      });
      
      if (!toastShownRef.current) {
        toast.error(error.response?.data?.message || "Failed to load presets");
        toastShownRef.current = true;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Check file type (assuming .lrtemplate for Lightroom)
    if (!file.name.endsWith('.lrtemplate')) {
      toast.error("Only .lrtemplate files are allowed");
      return;
    }
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit");
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      file,
      filePreview: URL.createObjectURL(file)
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (!files.length) return;
    
    // Check if adding these files would exceed the 4 image limit
    const currentImageCount = formData.images?.length || 0;
    if (currentImageCount + files.length > 4) {
      toast.error("Maximum 4 images allowed");
      return;
    }
    
    // Validate each file
    const validFiles = [];
    const validPreviews = [];
    
    for (const file of files) {
      // Check file type (images only)
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }
      
      // Check file size (5MB limit per image)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`);
        continue;
      }
      
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }
    
    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...validFiles],
        imagePreviews: [...(prev.imagePreviews || []), ...validPreviews]
      }));
      toast.success(`${validFiles.length} image(s) added successfully`);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => {
      // Revoke the object URL to free memory
      if (prev.imagePreviews?.[index]) {
        URL.revokeObjectURL(prev.imagePreviews[index]);
      }
      
      return {
        ...prev,
        images: (prev.images || []).filter((_, i) => i !== index),
        imagePreviews: (prev.imagePreviews || []).filter((_, i) => i !== index)
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🚀 Form submitted! Starting preset creation...");
    console.log("📝 Current form data:", {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      price: formData.price,
      hasFile: !!formData.file,
      fileName: formData.file?.name,
      imageCount: formData.images?.length || 0
    });
    setIsLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("price", formData.price);
      if (formData.file) {
        formDataToSend.append("file", formData.file);
      }
      // Append multiple images (if any)
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((image, index) => {
          formDataToSend.append(`images`, image);
        });
      }

      let response;
      if (editingPresetId) {
        // Update preset
        response = await adminApi.presets.update(editingPresetId, formDataToSend);
        if (response.data && response.data.success) {
          // Update local state
          setPresets(prev => ({
            ...prev,
            myPresets: prev.myPresets.map(p => 
              p._id === editingPresetId ? response.data.preset : p
            )
          }));
          toast.success("Preset updated successfully!");
        }
      } else {
        // Create new preset
        console.log("Creating new preset with data:", formDataToSend);
        response = await adminApi.presets.create(formDataToSend);
        console.log("API Response:", response);
        
        if (response.data && response.data.success) {
          // Add to local state
          console.log("Adding preset to state:", response.data.preset);
          setPresets(prev => ({
            ...prev,
            myPresets: [...prev.myPresets, response.data.preset]
          }));
          toast.success("Preset created successfully!");
        } else {
          console.error("API response indicates failure:", response.data);
          toast.error(response.data?.message || "Failed to create preset - API response indicates failure");
        }
      }

      // Reset form
      setFormData({
        name: "",
        description: "",
        category: "",
        price: "",
        file: null,
        filePreview: null,
        images: [],
        imagePreviews: []
      });
      setIsModalOpen(false);
      setEditingPresetId(null);
      
    } catch (error) {
      console.error("Failed to save preset:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.code === 'ERR_NETWORK') {
        toast.error("Network error - Backend server might not be running");
      } else {
        toast.error(error.response?.data?.message || "Failed to save preset");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (preset) => {
    setEditingPresetId(preset._id);
    setFormData({
      name: preset.name,
      description: preset.description,
      category: preset.category,
      price: preset.price,
      file: null,
      filePreview: null,
      images: [],
      imagePreviews: []
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (presetId) => {
    try {
      const response = await adminApi.presets.delete(presetId);
      
      if (response.data && response.data.success) {
        // Remove from local state
        setPresets(prev => ({
          myPresets: prev.myPresets.filter(p => p._id !== presetId),
          sharedPresets: prev.sharedPresets.filter(p => p._id !== presetId)
        }));
        toast.success("Preset deleted successfully");
      } else {
        throw new Error(response.data?.message || 'Failed to delete preset');
      }
    } catch (error) {
      console.error("Failed to delete preset:", error);
      toast.error(error.response?.data?.message || "Failed to delete preset");
    }
  };

  const uploadToGoogleDrive = async (presetId) => {
    try {
      const preset = presets.myPresets.find(p => p._id === presetId);
      if (!preset) {
        toast.error("Preset not found");
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading(`Uploading "${preset.name}" to Google Drive...`);
      
      const response = await adminApi.presets.uploadToDrive({
        presetId: presetId,
        fileName: preset.file,
        presetName: preset.name
      });

      if (response.data && response.data.success) {
        toast.dismiss(loadingToast);
        toast.success(`"${preset.name}" uploaded to Google Drive successfully!`);
        
        // Optionally update the preset with drive link
        if (response.data.driveLink) {
          setPresets(prev => ({
            ...prev,
            myPresets: prev.myPresets.map(p => 
              p._id === presetId 
                ? { ...p, driveLink: response.data.driveLink }
                : p
            )
          }));
        }
      } else {
        throw new Error(response.data?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Failed to upload to Google Drive:', error);
      toast.error(error.response?.data?.message || `Failed to upload "${preset?.name || 'preset'}" to Google Drive`);
    }
  };

  const getFileUrl = (fileName) => {
    if (!fileName) return "";
    if (fileName.startsWith("http")) return fileName;
    return `${API_URL}/presets/${fileName}`;
  };

  const formatPrice = (price) => {
    if (!price) return "";
    // If price already starts with Rs, return as is
    if (price.toString().startsWith("Rs")) return price;
    // Otherwise, add Rs prefix
    return `Rs ${price}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Presets</h1>
          <p className="text-slate-400 mt-1">Total: {presets.myPresets.length} presets</p>
        </div>
        <button
          onClick={() => {
            setFormData({
              name: "",
              description: "",
              category: "",
              price: "",
              file: null,
              filePreview: null
            });
            setIsModalOpen(true);
          }}
          className="bg-cyan-600 text-white px-6 py-2.5 rounded-lg hover:bg-cyan-500 transition-all duration-200 w-full md:w-auto shadow-lg hover:shadow-cyan-500/25"
        >
          Add Preset
        </button>
      </div>

      {/* My Presets Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">My Presets</h2>
          <span className="text-slate-400">{presets.myPresets.length} presets</span>
        </div>
        
        {presets.myPresets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {presets.myPresets.map((preset) => (
              <div key={preset._id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{preset.name}</h3>
                      <p className="text-slate-400 mt-1">{preset.description}</p>
                      {preset.price && (
                        <p className="text-emerald-400 font-semibold mt-2">{formatPrice(preset.price)}</p>
                      )}
                    </div>
                    <span className="bg-cyan-500/10 text-cyan-400 text-xs font-medium px-2.5 py-0.5 rounded-lg border border-cyan-500/20">
                      {preset.category}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex justify-end items-center">
                    <div className="flex gap-2">
                      <button
                        onClick={() => uploadToGoogleDrive(preset._id)}
                        className="text-emerald-400 hover:text-emerald-300 text-sm bg-emerald-500/10 px-3 py-1 rounded-lg hover:bg-emerald-500/20 transition-all duration-200"
                      >
                        Upload to Drive
                      </button>
                      <button
                        onClick={() => handleEdit(preset)}
                        className="text-cyan-400 hover:text-cyan-300 text-sm bg-cyan-500/10 px-3 py-1 rounded-lg hover:bg-cyan-500/20 transition-all duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(preset._id)}
                        className="text-red-400 hover:text-red-300 text-sm bg-red-500/10 px-3 py-1 rounded-lg hover:bg-red-500/20 transition-all duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 text-center">
            <p className="text-slate-400">You don't have any presets yet</p>
          </div>
        )}
      </div>



      {/* Add/Edit Preset Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800/90 rounded-xl border border-slate-700/50 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">
                  {editingPresetId ? "Edit Preset" : "Add New Preset"}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingPresetId(null);
                  }}
                  className="text-slate-400 hover:text-slate-300 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400">Preset Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-200"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-200"
                    rows="3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 block w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-200"
                    required
                  >
                    <option value="" className="bg-slate-800 text-white">Select a category</option>
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category} className="bg-slate-800 text-white">{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400">Price</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g., Rs 1599"
                    className="mt-1 block w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Files Upload - Preset File & Preview Images
                  </label>
                  
                  {/* Unified Upload Area */}
                  <div className="border-2 border-dashed border-slate-700/50 hover:border-cyan-500/50 rounded-lg p-6 transition-all duration-200 mb-4">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Preset File Upload */}
                        <div className="text-center">
                          <label className="cursor-pointer block">
                            <input
                              type="file"
                              accept=".lrtemplate"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                            <div className="bg-slate-800/50 hover:bg-slate-700/50 rounded-lg p-4 transition-all duration-200">
                              <svg className="mx-auto h-8 w-8 text-cyan-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p className="text-sm font-medium text-white mb-1">Upload Preset File</p>
                              <p className="text-xs text-slate-400">.lrtemplate only (max 5MB)</p>
                            </div>
                          </label>
                        </div>
                        
                        {/* Images Upload */}
                        <div className="text-center">
                          <label className="cursor-pointer block">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageChange}
                              className="hidden"
                              disabled={(formData.images?.length || 0) >= 4}
                            />
                            <div className={`bg-slate-800/50 hover:bg-slate-700/50 rounded-lg p-4 transition-all duration-200 ${
                              (formData.images?.length || 0) >= 4 ? 'opacity-50 cursor-not-allowed' : ''
                            }`}>
                              <svg className="mx-auto h-8 w-8 text-emerald-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-sm font-medium text-white mb-1">
                                {(formData.images?.length || 0) >= 4 ? 'Max Images Reached' : 'Upload Preview Images'}
                              </p>
                              <p className="text-xs text-slate-400">
                                {(formData.images?.length || 0) < 4 ? `Images only (${4 - (formData.images?.length || 0)} slots left)` : 'Maximum 4 images'}
                              </p>
                            </div>
                          </label>
                        </div>
                      </div>
                      
                      <p className="text-xs text-slate-500 mt-4">
                        Drag and drop files here or click the upload areas above
                      </p>
                    </div>
                  </div>
                  
                  {/* Uploaded Files Display */}
                  <div className="space-y-4">
                    {/* Preset File Display */}
                    {formData.filePreview && (
                      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <svg className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-white">Preset File</p>
                              <p className="text-xs text-slate-400">{formData.file?.name}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, file: null, filePreview: null })}
                            className="text-red-400 hover:text-red-300 transition-colors duration-200 p-1"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Preview Images Display */}
                    {(formData.imagePreviews?.length || 0) > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-3">Preview Images ({formData.imagePreviews?.length || 0}/4)</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {(formData.imagePreviews || []).map((preview, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-video bg-slate-900/50 border border-slate-700/50 rounded-lg overflow-hidden">
                                <img 
                                  src={preview} 
                                  alt={`Preview ${index + 1}`} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                {formData.images?.[index]?.name || `Image ${index + 1}`}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingPresetId(null);
                    }}
                    className="flex-1 bg-slate-700/50 text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-600/50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-500 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
                    disabled={!formData.name || !formData.category}
                  >
                    {editingPresetId ? "Update Preset" : "Add Preset"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Presets;