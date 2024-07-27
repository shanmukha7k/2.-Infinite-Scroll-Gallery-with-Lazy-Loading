import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const observer = useRef();
  const imageObserver = useRef();

  const loadImages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://api.unsplash.com/photos?page=${page}&client_id=Z1CHMZHt0vXz-IpVU--K4vJLXKfb5Ip-8-3lp49NWzM`);
      setImages(prevImages => [...prevImages, ...response.data]);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const handleImageIntersection = useCallback((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        observer.unobserve(img);
      }
    });
  }, []);

  useEffect(() => {
    imageObserver.current = new IntersectionObserver(handleImageIntersection, {
      rootMargin: '50px',
      threshold: 0.0003
    });

    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      imageObserver.current.observe(img);
    });

    return () => {
      if (imageObserver.current) {
        imageObserver.current.disconnect();
      }
    };
  }, [handleImageIntersection]);

  const lastImageElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading]);

  return (
    <div className="gallery">
      {images.map((image, index) => {
        const isLastImage = images.length === index + 1;
        return (
          <img
            ref={isLastImage ? lastImageElementRef : null}
            key={image.id}
            data-src={image.urls.regular} 
            src={image.urls.thumb} 
            alt={image.alt_description}
            style={{ width: '100%', height: 'auto' }} 
          />
        );
      })}
      {loading && <p>Loading...</p>}
    </div>
  );
};

export default Gallery;
