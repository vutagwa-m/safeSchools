import React, { useState } from 'react';
import { db, auth, storage } from '../firebase/config'; 
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import '../styles/ReportForm.css'; 

const ReportForm = ({ onSubmit, isAnonymous = false }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    severity: '',
    isAnonymous: false,
  });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCategoryChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      category: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.description.trim() === '') {
      alert('Please provide a description.');
      return;
    }

    setSubmitting(true);
    let fileURL = null;

    if (file) {
      const storageRef = ref(storage, `reports/${auth.currentUser?.uid}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      try {
        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
              console.log('Upload is ' + progress + '% done');
            },
            (error) => {
              console.error('Error uploading file:', error);
              setSubmitting(false);
              reject(error);
            },
            async () => {
              fileURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      } catch (error) {
        alert('Failed to upload file.');
        return;
      }
    }

    const reportData = {
      ...formData,
      category: formData.category === 'Other' ? customCategory : formData.category,
      createdAt: new Date(),
      status: 'pending',
      reporterId: isAnonymous ? null : auth.currentUser?.uid,
      studentPseudonym: isAnonymous ? `Anonymous${Math.floor(1000 + Math.random() * 9000)}` : null,
      fileURL: fileURL,
    };

    try {
  if (isAnonymous) {
    onSubmit(reportData);
  } else {
    await addDoc(collection(db, 'reports'), reportData);
    onSubmit(reportData);
  }
  setSubmitting(false);
  setIsSubmitted(true);
} catch (err) {
  console.error('Error submitting report:', err);
  setSubmitting(false);
  alert('Failed to submit report.');
}
  }

  return (
    <div className="report-form-container">
      <h2>Submit a Report</h2>
      <form onSubmit={handleSubmit}>
        <label>Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleCategoryChange}
          required
        >
          <option value="">Select Category</option>
          <option value="GBV">Gender-Based Violence</option>
          <option value="Bullying">Bullying</option>
          <option value="Mental Health">Mental Health Concern</option>
          <option value="Other">Other</option>
        </select>

        {formData.category === 'Other' && (
          <div className="custom-category-container">
            <label>Specify Category</label>
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Enter custom category"
              required
            />
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
            Severity
          </label>
          <select
            id="severity"
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">Select Severity</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={5}
          placeholder="Describe what happened..."
        />

        <label>Attach File (optional)</label>
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*,.pdf,.doc,.docx"
        />
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="upload-progress">
            Uploading: {Math.round(uploadProgress)}%
          </div>
        )}

        <div className="checkbox-container">
          <input
            type="checkbox"
            name="isAnonymous"
            checked={formData.isAnonymous}
            onChange={handleChange}
          />
          <label>Submit Anonymously</label>
        </div>

        <div className="buttons-container">
          <button type="submit" disabled={submitting} className="submit-btn">
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
          <button type="button" onClick={() => navigate('/')} className="cancel-btn">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm;