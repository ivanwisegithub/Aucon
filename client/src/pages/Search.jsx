import { Button, Select, TextInput } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';

export default function Search() {
  const [sidebarData, setSidebarData] = useState({
    searchTerm: '',
    sort: 'desc',
    category: 'uncategorized',
  });

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    const sortFromUrl = urlParams.get('sort');
    const categoryFromUrl = urlParams.get('category');

    if (searchTermFromUrl || sortFromUrl || categoryFromUrl) {
      setSidebarData((prev) => ({
        ...prev,
        searchTerm: searchTermFromUrl || '',
        sort: sortFromUrl || 'desc',
        category: categoryFromUrl || 'uncategorized',
      }));
    }

    const fetchPosts = async () => {
      setLoading(true);
      const query = urlParams.toString();
      const res = await fetch(`/api/post/getposts?${query}`);
      const data = await res.json();
      if (res.ok) {
        setPosts(data.posts);
        setShowMore(data.posts.length === 9);
      }
      setLoading(false);
    };

    fetchPosts();
  }, [location.search]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setSidebarData({ ...sidebarData, [id]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    if (sidebarData.searchTerm) urlParams.set('searchTerm', sidebarData.searchTerm);
    urlParams.set('sort', sidebarData.sort);
    urlParams.set('category', sidebarData.category);
    navigate(`/search?${urlParams.toString()}`);
  };

  const handleShowMore = async () => {
    const startIndex = posts.length;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', startIndex);
    const res = await fetch(`/api/post/getposts?${urlParams.toString()}`);
    const data = await res.json();
    if (res.ok) {
      setPosts([...posts, ...data.posts]);
      setShowMore(data.posts.length === 9);
    }
  };

  return (
    <div className='flex flex-col md:flex-row'>
      {/* Sidebar */}
      <div className='p-7 border-b md:border-r md:min-h-screen border-gray-500'>
        <form className='flex flex-col gap-8' onSubmit={handleSubmit}>
          <div className='flex items-center gap-2'>
            <label className='font-semibold'>Search:</label>
            <TextInput
              id='searchTerm'
              type='text'
              placeholder='Search feedback...'
              value={sidebarData.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className='flex items-center gap-2'>
            <label className='font-semibold'>Sort:</label>
            <Select id='sort' value={sidebarData.sort} onChange={handleChange}>
              <option value='desc'>Most Recent</option>
              <option value='asc'>Oldest First</option>
            </Select>
          </div>
          <div className='flex items-center gap-2'>
            <label className='font-semibold'>Category:</label>
            <Select id='category' value={sidebarData.category} onChange={handleChange}>
              <option value='uncategorized'>All</option>
              <option value='Dining & Meals'>Dining & Meals</option>
              <option value='Accommodation & Hostels'>Accommodation & Hostels</option>
              <option value='Health & Sanitation'>Health & Sanitation</option>
              <option value='Academic Facilities'>Academic Facilities</option>
              <option value='ICT & Internet'>ICT & Internet</option>
              <option value='Policy Concerns'>Policy Concerns</option>
              <option value='Security & Emergency'>Security & Emergency</option>
              <option value='Welfare Initiative'>Welfare Initiative</option>
            </Select>
          </div>
          <Button type='submit' outline gradientDuoTone='purpleToPink'>
            Apply Filters
          </Button>
        </form>
      </div>

      {/* Results */}
      <div className='w-full'>
        <h1 className='text-3xl font-semibold border-b border-gray-500 p-3 mt-5'>
          Feedback Results
        </h1>
        <div className='p-7 flex flex-wrap gap-4'>
          {loading && <p className='text-gray-400 text-lg'>Loading...</p>}
          {!loading && posts.length === 0 && (
            <p className='text-gray-400 text-lg'>No feedback found.</p>
          )}
          {!loading &&
            posts.map((post) => <PostCard key={post._id} post={post} />)}
        </div>

        {showMore && (
          <div className='text-center mb-10'>
            <button
              onClick={handleShowMore}
              className='text-teal-600 dark:text-teal-400 hover:underline'
            >
              Show More Feedback
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
