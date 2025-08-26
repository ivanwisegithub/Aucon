import { Alert, Button, FileInput, Select, TextInput, Checkbox } from 'flowbite-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import { useState } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useNavigate } from 'react-router-dom';

export default function CreatePost() {
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({ urgency: 'Medium', anonymous: false });
  const [publishError, setPublishError] = useState(null);
  const navigate = useNavigate();

  const handleUploadImage = async () => {
    try {
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
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadProgress(progress.toFixed(0));
        },
        () => {
          setImageUploadError('Image upload failed');
          setImageUploadProgress(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImageUploadProgress(null);
            setImageUploadError(null);
            setFormData({ ...formData, image: downloadURL });
          });
        }
      );
    } catch (error) {
      console.log(error);
      setImageUploadError('Image upload failed');
      setImageUploadProgress(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/post/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message);
        return;
      }
      navigate(`/post/${data.slug}`);
    } catch (error) {
      setPublishError('Something went wrong');
    }
  };

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">
        Submit Student Feedback
      </h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput
            type="text"
            placeholder="Feedback Title (e.g., 'Water Shortage in Block C')"
            required
            id="title"
            className="flex-1"
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <Select
            required
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          >
            <option value="">Select Category</option>
            <option value="Dining & Meals">Dining & Meals</option>
            <option value="Accommodation & Hostels">Accommodation & Hostels</option>
            <option value="Health & Sanitation">Health & Sanitation</option>
            <option value="Academic Facilities">Academic Facilities</option>
            <option value="ICT & Internet">ICT & Internet</option>
            <option value="Policy Concerns">Policy Concerns</option>
            <option value="Security & Emergency">Security & Emergency</option>
            <option value="Welfare Initiative">Welfare Initiative</option>
          </Select>
        </div>

        {/* Urgency & Anonymity */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            required
            onChange={(e) =>
              setFormData({ ...formData, urgency: e.target.value })
            }
            value={formData.urgency}
          >
            <option value="Low">Urgency: Low</option>
            <option value="Medium">Urgency: Medium</option>
            <option value="High">Urgency: High</option>
          </Select>

          <div className="flex items-center gap-2">
            <Checkbox
              id="anonymous"
              onChange={(e) =>
                setFormData({ ...formData, anonymous: e.target.checked })
              }
              checked={formData.anonymous}
            />
            <label
              htmlFor="anonymous"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              Submit Anonymously
            </label>
          </div>
        </div>

        {/* File Upload */}
        <div className="flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3">
          <FileInput
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <Button
            type="button"
            gradientDuoTone="purpleToBlue"
            size="sm"
            outline
            onClick={handleUploadImage}
            disabled={imageUploadProgress}
          >
            {imageUploadProgress ? (
              <div className="w-16 h-16">
                <CircularProgressbar
                  value={imageUploadProgress}
                  text={`${imageUploadProgress || 0}%`}
                />
              </div>
            ) : (
              'Upload Screenshot'
            )}
          </Button>
        </div>

        {imageUploadError && <Alert color="failure">{imageUploadError}</Alert>}

        {formData.image && (
          <img
            src={formData.image}
            alt="Uploaded Screenshot"
            className="w-full h-72 object-cover"
          />
        )}

        {/* Description */}
        <ReactQuill
          theme="snow"
          placeholder="Describe your issue clearly, including time, place, and any action already taken..."
          className="h-72 mb-12"
          required
          onChange={(value) => setFormData({ ...formData, content: value })}
        />

        <Button type="submit" gradientDuoTone="purpleToPink">
          Submit Feedback
        </Button>

        {publishError && (
          <Alert className="mt-5" color="failure">
            {publishError}
          </Alert>
        )}
      </form>
    </div>
  );
}
