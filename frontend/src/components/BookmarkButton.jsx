import { useState, useEffect } from 'react';
import api from '../api/axios';

const BookmarkButton = ({ problemId, initialState, onToggle }) => {
    // Determine initial state: prioritize prop if available
    const [isBookmarked, setIsBookmarked] = useState(initialState || false);
    const [loading, setLoading] = useState(false);

    // Sync with prop changes if they come from parent
    useEffect(() => {
        if (initialState !== undefined) {
            setIsBookmarked(initialState);
        }
    }, [initialState]);

    // We don't need checkBookmark useEffect anymore because data comes from Dashboard

    const toggleBookmark = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (loading) return;
        setLoading(true);

        try {
            if (isBookmarked) {
                await api.delete(`/bookmarks/${problemId}`);
                setIsBookmarked(false);
                if (onToggle) onToggle(false);
            } else {
                await api.post('/bookmarks', { problemId });
                setIsBookmarked(true);
                if (onToggle) onToggle(true);
            }
        } catch (err) {
            console.error('Failed to toggle bookmark');
            // Revert on error
            setIsBookmarked(!isBookmarked);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
            onClick={toggleBookmark}
            disabled={loading}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark this problem'}
        >
            {isBookmarked ? '⭐' : '☆'}
        </button>
    );
};

export default BookmarkButton;
