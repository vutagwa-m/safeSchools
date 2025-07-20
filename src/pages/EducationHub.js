import React, { useEffect, useState } from 'react';
import { 
  db, 
  auth, 
  storage 
} from '../firebase/config';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  query,
  orderBy,
  where,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import '../styles/EducationHub.css';

const EducationHub = () => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    file: null
  });
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState(null);
  const [userInteractions, setUserInteractions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePost, setActivePost] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch user data and interactions
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const interactionsRef = doc(db, 'user_interactions', currentUser.uid);
        const interactionsSnap = await getDocs(interactionsRef);
        if (interactionsSnap.exists()) {
          setUserInteractions(interactionsSnap.data());
        } else {
          setUserInteractions({
            upvotedPosts: [],
            downvotedPosts: [],
            flaggedPosts: []
          });
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let q = query(
          collection(db, 'education_hub/posts'),
          orderBy('createdAt', 'desc')
        );

        if (filter === 'flagged') {
          q = query(q, where('isFlagged', '==', true));
        }

        const snapshot = await getDocs(q);
        const postsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setPosts(postsData);
      } catch (err) {
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [filter]);

  // Fetch comments for active post
  useEffect(() => {
    if (!activePost) return;

    const fetchComments = async () => {
      try {
        const q = query(
          collection(db, 'education_hub/comments'),
          where('postId', '==', activePost.id),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(q);
        const commentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setComments(prev => ({
          ...prev,
          [activePost.id]: commentsData
        }));
      } catch (err) {
        console.error('Error fetching comments:', err);
      }
    };

    fetchComments();
  }, [activePost]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please log in to create posts');

    try {
      let fileUrl = '';
      if (newPost.file) {
        const storageRef = ref(storage, `posts/${newPost.file.name}_${Date.now()}`);
        const uploadTask = await uploadBytes(storageRef, newPost.file);
        fileUrl = await getDownloadURL(uploadTask.ref);
      }

      const postData = {
        title: newPost.title,
        content: newPost.content,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        createdAt: serverTimestamp(),
        views: 0,
        upvotes: 0,
        downvotes: 0,
        isFlagged: false,
        flags: [],
        status: 'active',
        ...(fileUrl && { fileUrl })
      };

      await addDoc(collection(db, 'education_hub/posts'), postData);
      setNewPost({ title: '', content: '', file: null });
      // Refresh posts
      setLoading(true);
      setFilter('all');
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const handleAddComment = async (postId) => {
    if (!user || !newComment.trim()) return;

    try {
      const commentData = {
        postId,
        content: newComment,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        createdAt: serverTimestamp(),
        isRestricted: false,
        status: 'active'
      };

      await addDoc(collection(db, 'education_hub/comments'), commentData);
      setNewComment('');
      // Refresh comments
      setComments(prev => ({
        ...prev,
        [postId]: [
          {
            id: 'temp',
            ...commentData,
            createdAt: new Date()
          },
          ...(prev[postId] || [])
        ]
      }));
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleViewPost = async (post) => {
    try {
      // Increment view count
      await updateDoc(doc(db, 'education_hub/posts', post.id), {
        views: increment(1)
      });
      
      setPosts(prev => 
        prev.map(p => 
          p.id === post.id ? { ...p, views: (p.views || 0) + 1 } : p
        )
      );
      
      setActivePost(post);
    } catch (err) {
      console.error('Error updating view count:', err);
    }
  };

  const handleVote = async (postId, voteType) => {
    if (!user) return alert('Please log in to vote');

    try {
      const postRef = doc(db, 'education_hub/posts', postId);
      const interactionsRef = doc(db, 'user_interactions', user.uid);

      if (voteType === 'upvote') {
        // If already upvoted, remove upvote
        if (userInteractions.upvotedPosts.includes(postId)) {
          await updateDoc(postRef, {
            upvotes: increment(-1)
          });
          await updateDoc(interactionsRef, {
            upvotedPosts: arrayRemove(postId)
          });
        } 
        // If downvoted, switch to upvote
        else if (userInteractions.downvotedPosts.includes(postId)) {
          await updateDoc(postRef, {
            downvotes: increment(-1),
            upvotes: increment(1)
          });
          await updateDoc(interactionsRef, {
            downvotedPosts: arrayRemove(postId),
            upvotedPosts: arrayUnion(postId)
          });
        }
        // If not voted, add upvote
        else {
          await updateDoc(postRef, {
            upvotes: increment(1)
          });
          await updateDoc(interactionsRef, {
            upvotedPosts: arrayUnion(postId)
          });
        }
      } else if (voteType === 'downvote') {
        // Similar logic for downvotes
        if (userInteractions.downvotedPosts.includes(postId)) {
          await updateDoc(postRef, {
            downvotes: increment(-1)
          });
          await updateDoc(interactionsRef, {
            downvotedPosts: arrayRemove(postId)
          });
        } 
        else if (userInteractions.upvotedPosts.includes(postId)) {
          await updateDoc(postRef, {
            upvotes: increment(-1),
            downvotes: increment(1)
          });
          await updateDoc(interactionsRef, {
            upvotedPosts: arrayRemove(postId),
            downvotedPosts: arrayUnion(postId)
          });
        }
        else {
          await updateDoc(postRef, {
            downvotes: increment(1)
          });
          await updateDoc(interactionsRef, {
            downvotedPosts: arrayUnion(postId)
          });
        }
      }

      // Update local state
      const updatedInteractions = { ...userInteractions };
      if (voteType === 'upvote') {
        if (updatedInteractions.upvotedPosts.includes(postId)) {
          updatedInteractions.upvotedPosts = updatedInteractions.upvotedPosts.filter(id => id !== postId);
        } else {
          updatedInteractions.upvotedPosts = [...updatedInteractions.upvotedPosts, postId];
          updatedInteractions.downvotedPosts = updatedInteractions.downvotedPosts.filter(id => id !== postId);
        }
      } else {
        if (updatedInteractions.downvotedPosts.includes(postId)) {
          updatedInteractions.downvotedPosts = updatedInteractions.downvotedPosts.filter(id => id !== postId);
        } else {
          updatedInteractions.downvotedPosts = [...updatedInteractions.downvotedPosts, postId];
          updatedInteractions.upvotedPosts = updatedInteractions.upvotedPosts.filter(id => id !== postId);
        }
      }
      setUserInteractions(updatedInteractions);

      // Update posts list
      setPosts(prev => 
        prev.map(post => {
          if (post.id !== postId) return post;
          
          let upvotes = post.upvotes || 0;
          let downvotes = post.downvotes || 0;
          
          if (voteType === 'upvote') {
            if (userInteractions.upvotedPosts.includes(postId)) {
              upvotes -= 1;
            } else if (userInteractions.downvotedPosts.includes(postId)) {
              downvotes -= 1;
              upvotes += 1;
            } else {
              upvotes += 1;
            }
          } else {
            if (userInteractions.downvotedPosts.includes(postId)) {
              downvotes -= 1;
            } else if (userInteractions.upvotedPosts.includes(postId)) {
              upvotes -= 1;
              downvotes += 1;
            } else {
              downvotes += 1;
            }
          }
          
          return { ...post, upvotes, downvotes };
        })
      );

    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const handleFlagPost = async (postId) => {
    if (!user) return alert('Please log in to flag posts');

    try {
      const postRef = doc(db, 'education_hub/posts', postId);
      const interactionsRef = doc(db, 'user_interactions', user.uid);

      if (userInteractions.flaggedPosts.includes(postId)) {
        // Unflag
        await updateDoc(postRef, {
          flags: arrayRemove(user.uid),
          isFlagged: false
        });
        await updateDoc(interactionsRef, {
          flaggedPosts: arrayRemove(postId)
        });
      } else {
        // Flag
        await updateDoc(postRef, {
          flags: arrayUnion(user.uid),
          isFlagged: true
        });
        await updateDoc(interactionsRef, {
          flaggedPosts: arrayUnion(postId)
        });
      }

      // Update local state
      const updatedInteractions = { ...userInteractions };
      if (updatedInteractions.flaggedPosts.includes(postId)) {
        updatedInteractions.flaggedPosts = updatedInteractions.flaggedPosts.filter(id => id !== postId);
      } else {
        updatedInteractions.flaggedPosts = [...updatedInteractions.flaggedPosts, postId];
      }
      setUserInteractions(updatedInteractions);

      // Update posts list
      setPosts(prev => 
        prev.map(post => {
          if (post.id !== postId) return post;
          
          let flags = [...(post.flags || [])];
          let isFlagged = post.isFlagged;
          
          if (flags.includes(user.uid)) {
            flags = flags.filter(id => id !== user.uid);
            isFlagged = flags.length > 0;
          } else {
            flags.push(user.uid);
            isFlagged = true;
          }
          
          return { ...post, flags, isFlagged };
        })
      );

    } catch (err) {
      console.error('Error flagging post:', err);
    }
  };

  const handleRestrictComment = async (commentId) => {
    if (!user || !['admin', 'support'].includes(user.role)) return;

    try {
      await updateDoc(doc(db, 'education_hub/comments', commentId), {
        isRestricted: true,
        status: 'restricted'
      });

      // Update local state
      if (activePost) {
        setComments(prev => ({
          ...prev,
          [activePost.id]: (prev[activePost.id] || []).map(comment => 
            comment.id === commentId 
              ? { ...comment, isRestricted: true, status: 'restricted' } 
              : comment
          )
        }));
      }
    } catch (err) {
      console.error('Error restricting comment:', err);
    }
  };

  const handleMarkPostAsSensitive = async (postId) => {
    if (!user || !['admin', 'support'].includes(user.role)) return;

    try {
      await updateDoc(doc(db, 'education_hub/posts', postId), {
        status: 'sensitive'
      });

      // Update local state
      setPosts(prev => 
        prev.map(post => 
          post.id === postId ? { ...post, status: 'sensitive' } : post
        )
      );
    } catch (err) {
      console.error('Error marking post as sensitive:', err);
    }
  };

  const filteredPosts = posts.filter(post => {
    // Filter by status
    if (post.status === 'removed') return false;
    
    // Filter by search term
    if (searchTerm && 
        !post.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !post.content.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="education-hub">
      <div className="hub-header">
        <h1>Education Hub</h1>
        <div className="hub-controls">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Posts</option>
            <option value="flagged">Flagged Posts</option>
            {user && ['admin', 'support'].includes(user.role) && (
              <option value="sensitive">Sensitive Content</option>
            )}
          </select>
        </div>
      </div>

      <div className="hub-layout">
        {/* Posts List */}
        <div className="posts-list">
          {loading ? (
            <div className="loading">Loading posts...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="no-posts">No posts found</div>
          ) : (
            filteredPosts.map(post => (
              <div 
                key={post.id} 
                className={`post-card ${post.isFlagged ? 'flagged' : ''} ${post.status === 'sensitive' ? 'sensitive' : ''}`}
              >
                <div className="post-header">
                  <h3 onClick={() => handleViewPost(post)}>{post.title}</h3>
                  <span className="post-meta">
                    by {post.authorName} • {post.createdAt?.toDate().toLocaleDateString()}
                  </span>
                </div>
                <div className="post-content-preview">
                  {post.content.substring(0, 150)}...
                </div>
                <div className="post-stats">
                  <span>{post.views || 0} views</span>
                  <span>{post.upvotes || 0} upvotes</span>
                  <span>{post.downvotes || 0} downvotes</span>
                </div>
                <div className="post-actions">
                  <button 
                    onClick={() => handleVote(post.id, 'upvote')}
                    disabled={!user}
                    className={userInteractions?.upvotedPosts.includes(post.id) ? 'active' : ''}
                  >
                    👍 Upvote
                  </button>
                  <button 
                    onClick={() => handleVote(post.id, 'downvote')}
                    disabled={!user}
                    className={userInteractions?.downvotedPosts.includes(post.id) ? 'active' : ''}
                  >
                    👎 Downvote
                  </button>
                  <button 
                    onClick={() => handleFlagPost(post.id)}
                    disabled={!user}
                    className={userInteractions?.flaggedPosts.includes(post.id) ? 'active' : ''}
                  >
                    🚩 Flag
                  </button>
                  {user && ['admin', 'support'].includes(user.role) && (
                    <button 
                      onClick={() => handleMarkPostAsSensitive(post.id)}
                      disabled={post.status === 'sensitive'}
                    >
                      ⚠️ Mark Sensitive
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Post Detail View */}
        {activePost && (
          <div className="post-detail">
            <button className="back-button" onClick={() => setActivePost(null)}>
              ← Back to all posts
            </button>
            
            <div className="post-full">
              <h2>{activePost.title}</h2>
              <div className="post-meta">
                Posted by {activePost.authorName} on {activePost.createdAt?.toDate().toLocaleDateString()}
              </div>
              <div className="post-content">
                {activePost.content}
              </div>
              {activePost.fileUrl && (
                <div className="post-file">
                  <a href={activePost.fileUrl} target="_blank" rel="noopener noreferrer">
                    View attached file
                  </a>
                </div>
              )}
              <div className="post-stats">
                <span>{activePost.views || 0} views</span>
                <span>{activePost.upvotes || 0} upvotes</span>
                <span>{activePost.downvotes || 0} downvotes</span>
                {activePost.isFlagged && <span className="flag-warning">⚠️ Flagged</span>}
                {activePost.status === 'sensitive' && <span className="sensitive-warning">⚠️ Sensitive Content</span>}
              </div>
            </div>

            {/* Comments Section */}
            <div className="comments-section">
              <h3>Comments</h3>
              
              {user && (
                <div className="add-comment">
                  <textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button 
                    onClick={() => handleAddComment(activePost.id)}
                    disabled={!newComment.trim()}
                  >
                    Post Comment
                  </button>
                </div>
              )}

              {comments[activePost.id]?.length ? (
                <div className="comments-list">
                  {comments[activePost.id].map(comment => (
                    <div 
                      key={comment.id} 
                      className={`comment ${comment.isRestricted ? 'restricted' : ''}`}
                    >
                      <div className="comment-header">
                        <strong>{comment.authorName}</strong>
                        <span>{comment.createdAt?.toDate().toLocaleDateString()}</span>
                      </div>
                      <div className="comment-content">
                        {comment.isRestricted 
                          ? 'This comment has been restricted by moderators'
                          : comment.content}
                      </div>
                      {user && ['admin', 'support'].includes(user.role) && !comment.isRestricted && (
                        <button 
                          onClick={() => handleRestrictComment(comment.id)}
                          className="restrict-button"
                        >
                          Restrict Comment
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-comments">No comments yet</div>
              )}
            </div>
          </div>
        )}

        {/* Create Post Form */}
        {!activePost && user && (
          <div className="create-post">
            <h2>Create New Post</h2>
            <form onSubmit={handleCreatePost}>
              <input
                type="text"
                placeholder="Title"
                value={newPost.title}
                onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                required
              />
              <textarea
                placeholder="Content"
                value={newPost.content}
                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                required
              />
              <input
                type="file"
                onChange={(e) => setNewPost({...newPost, file: e.target.files[0]})}
              />
              <button type="submit" disabled={!newPost.title || !newPost.content}>
                Post to Education Hub
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default EducationHub;