import { Button, Spinner, Badge } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CallToAction from '../components/CallToAction';
import CommentSection from '../components/CommentSection';
import PostCard from '../components/PostCard';

export default function PostPage() {
  const { postSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [post, setPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/post/getposts?slug=${postSlug}`);
        const data = await res.json();
        if (!res.ok || !data.posts?.length) {
          setError(true);
        } else {
          setPost(data.posts[0]);
          setError(false);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postSlug]);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const res = await fetch('/api/post/getposts?limit=3');
        const data = await res.json();
        if (res.ok) {
          setRecentPosts(data.posts);
        }
      } catch (err) {
        console.error('Failed to fetch recent posts');
      }
    };
    fetchRecentPosts();
  }, []);

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Spinner size='xl' />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className='text-center mt-24 text-red-500 text-lg'>
        Unable to load this feedback post. Please try again later.
      </div>
    );
  }

  return (
    <main className='p-3 flex flex-col max-w-6xl mx-auto min-h-screen'>
      <h1 className='text-3xl mt-10 p-3 text-center font-serif max-w-2xl mx-auto lg:text-4xl'>
        {post.title}
      </h1>

      {/* Tags */}
      <div className='flex flex-wrap justify-center gap-3 mt-3'>
        <Link to={`/search?category=${post.category}`}>
          <Badge color='gray'>{post.category}</Badge>
        </Link>
        {post.urgency && (
          <Badge color='warning'>{post.urgency} Priority</Badge>
        )}
        <Badge color='indigo'>{post.status || 'Pending'}</Badge>
      </div>

      {/* Screenshot */}
      {post.image && (
        <img
          src={post.image}
          alt={post.title}
          className='mt-10 p-3 max-h-[600px] w-full object-cover rounded-lg shadow'
        />
      )}

      {/* Metadata */}
      <div className='flex justify-between p-3 border-b border-slate-500 mx-auto w-full max-w-2xl text-xs text-gray-400'>
        <span>
          Submitted on: {new Date(post.createdAt).toLocaleDateString()}
        </span>
        <span>
          Est. read time: {Math.max(1, Math.ceil(post.content.length / 800))} min
        </span>
      </div>

      {/* Submitter Identity */}
      {post.anonymous ? (
        <p className='text-center text-sm italic text-gray-400 mt-2'>
          Submitted anonymously
        </p>
      ) : (
        <p className='text-center text-sm italic text-gray-300 mt-2'>
          Submitted by: {post.authorName || 'Student'}
        </p>
      )}

      {/* Feedback Content */}
      <div
        className='p-3 max-w-2xl mx-auto w-full post-content'
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Call to Action */}
      <div className='max-w-4xl mx-auto mt-10'>
        <CallToAction />
      </div>

      {/* Comments or Admin Responses */}
      <CommentSection postId={post._id} />

      {/* Related Posts Section */}
      <div className='flex flex-col justify-center items-center mb-8 mt-12'>
        <h2 className='text-xl font-semibold'>Other Student Feedback</h2>
        <div className='flex flex-wrap gap-5 mt-5 justify-center'>
          {recentPosts &&
            recentPosts.map((p) => <PostCard key={p._id} post={p} />)}
        </div>
      </div>
    </main>
  );
}
