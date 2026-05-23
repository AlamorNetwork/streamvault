const express = require('express');
const router = express.Router();

// Mock video data for cover
const mockVideos = [
  {
    id: 'v1',
    title: 'The Dark Legacy',
    description: 'A mysterious tale of ancient secrets',
    thumbnail: 'https://picsum.photos/seed/dark1/400/225',
    duration: '2:15:30',
    views: '2.4M',
    rating: 4.8,
    category: 'Mystery',
    year: 2024
  },
  {
    id: 'v2',
    title: 'Serpent\'s Path',
    description: 'Journey through the shadows',
    thumbnail: 'https://picsum.photos/seed/dark2/400/225',
    duration: '1:45:20',
    views: '1.8M',
    rating: 4.6,
    category: 'Thriller',
    year: 2024
  },
  {
    id: 'v3',
    title: 'Emerald Chronicles',
    description: 'Power and ambition collide',
    thumbnail: 'https://picsum.photos/seed/dark3/400/225',
    duration: '2:30:15',
    views: '3.2M',
    rating: 4.9,
    category: 'Drama',
    year: 2023
  },
  {
    id: 'v4',
    title: 'Midnight Conspiracy',
    description: 'Trust no one in the darkness',
    thumbnail: 'https://picsum.photos/seed/dark4/400/225',
    duration: '1:55:40',
    views: '2.1M',
    rating: 4.7,
    category: 'Thriller',
    year: 2024
  },
  {
    id: 'v5',
    title: 'The Silver Dagger',
    description: 'Revenge served cold',
    thumbnail: 'https://picsum.photos/seed/dark5/400/225',
    duration: '2:05:25',
    views: '1.5M',
    rating: 4.5,
    category: 'Action',
    year: 2023
  },
  {
    id: 'v6',
    title: 'Shadows of Ambition',
    description: 'The price of power',
    thumbnail: 'https://picsum.photos/seed/dark6/400/225',
    duration: '2:20:10',
    views: '2.8M',
    rating: 4.8,
    category: 'Drama',
    year: 2024
  }
];

// GET /api/videos - Get all videos
router.get('/videos', (req, res) => {
  const { category, search } = req.query;
  
  let filtered = [...mockVideos];
  
  if (category && category !== 'all') {
    filtered = filtered.filter(v => v.category.toLowerCase() === category.toLowerCase());
  }
  
  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter(v => 
      v.title.toLowerCase().includes(term) || 
      v.description.toLowerCase().includes(term)
    );
  }
  
  res.json({
    success: true,
    count: filtered.length,
    videos: filtered
  });
});

// GET /api/videos/:id - Get single video
router.get('/videos/:id', (req, res) => {
  const video = mockVideos.find(v => v.id === req.params.id);
  
  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found'
    });
  }
  
  res.json({
    success: true,
    video: {
      ...video,
      streamUrl: `/api/stream/${video.id}`,
      subtitles: [],
      related: mockVideos.filter(v => v.id !== video.id).slice(0, 4)
    }
  });
});

// GET /api/featured - Get featured content
router.get('/featured', (req, res) => {
  res.json({
    success: true,
    featured: mockVideos.slice(0, 3)
  });
});

// GET /api/categories - Get all categories
router.get('/categories', (req, res) => {
  const categories = [...new Set(mockVideos.map(v => v.category))];
  res.json({
    success: true,
    categories
  });
});

// GET /api/stats - Platform stats (cover)
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    stats: {
      totalVideos: mockVideos.length,
      totalViews: '12.8M',
      activeUsers: '45.2K',
      newToday: 3
    }
  });
});

module.exports = router;
