import { Alert, Button, FileInput, Select, TextInput } from 'flowbite-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import { useEffect, useState } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function UpdatePost() {
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState(null);
  const [publishError, setPublishError] = useState(null);

  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/post/getposts?postId=${postId}`);
        const data = await res.json();
        if (res.ok) {
          setFormData(data.posts[0]);
        } else {
          setPublishError(data.message || 'Error loading post');
        }
      } catch (err) {
        setPublishError('Failed to fetch post');
      }
    };
    fetchPost();
  }, [postId]);

  const handleUploadImage = async () => {
    if (!file) {
      setImageUploadError('Please select an image');
      return;
    }
    setImageUploadError(null);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + '-' + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageUploadProgress(progress.toFixed(0));
      },
      () => {
        setImageUploadError('Image upload failed');
        setImageUploadProgress(null);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setFormData({ ...formData, image: url });
          setImageUploadProgress(null);
        });
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/post/updatepost/${formData._id}/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message || 'Update failed');
        return;
      }
      navigate(`/post/${data.slug}`);
    } catch (error) {
      setPublishError('An error occurred during update');
    }
  };

  if (!formData) {
    return <p className="text-center mt-10 text-white">Loading...</p>;
  }

  const isEditable = formData.status === 'Pending' && currentUser._id === formData.userId;

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">Update Feedback</h1>

      {!isEditable && (
        <Alert color="warning" className="mb-6">
          This feedback can no longer be edited. It may have already been reviewed or assigned.
        </Alert>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput
            type="text"
            placeholder="e.g. Water Leak in Hostel Block B"
            required
            id="title"
            disabled={!isEditable}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <Select
            value={formData.category}
            disabled={!isEditable}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="uncategorized">Select Category</option>
            <option value="Accommodation and Residence">Accommodation and Residence</option>
            <option value="Dining and Nutrition">Dining and Nutrition</option>
            <option value="Health and Hygiene">Health and Hygiene</option>
            <option value="ICT and Wi-Fi">ICT and Wi-Fi</option>
            <option value="Policy/Administration">Policy/Administration</option>
            <option value="First Aid/Emergencies">First Aid/Emergencies</option>
            <option value="Welfare Initiative Proposal">Welfare Initiative Proposal</option>
          </Select>
        </div>

        <div className="flex gap-4 items-center justify-between border-4 border-dotted border-teal-500 p-3">
          <FileInput
            type="file"
            accept="image/*"
            disabled={!isEditable}
            onChange={(e) => setFile(e.target.files[0])}
          />
          <Button
            type="button"
            size="sm"
            outline
            disabled={!isEditable || imageUploadProgress}
            gradientDuoTone="purpleToBlue"
            onClick={handleUploadImage}
          >
            {imageUploadProgress ? (
              <div className="w-16 h-16">
                <CircularProgressbar
                  value={imageUploadProgress}
                  text={`${imageUploadProgress}%`}
                />
              </div>
            ) : (
              'Upload Screenshot'
            )}
          </Button>
        </div>

        {imageUploadError && (
          <Alert color="failure">{imageUploadError}</Alert>
        )}

        {formData.image && (
          <img
            src={formData.image}
            alt="Uploaded file"
            className="w-full h-72 object-cover"
          />
        )}

        <ReactQuill
          theme="snow"
          value={formData.content}
          readOnly={!isEditable}
          className="h-72 mb-12"
          placeholder="Edit your feedback..."
          onChange={(value) => setFormData({ ...formData, content: value })}
        />

        {isEditable && (
          <Button type="submit" gradientDuoTone="purpleToPink">
            Save Changes
          </Button>
        )}

        {publishError && (
          <Alert className="mt-5" color="failure">
            {publishError}
          </Alert>
        )}
      </form>
    </div>
  );
}
