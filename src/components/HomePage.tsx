import React, { useState, useEffect } from 'react';
import UploadDropzone from './UploadDropzone';
import ToolGrid from './ToolGrid';
import { hasImage } from '../lib/storage';

export default function HomePage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hasImage().then(setReady);
  }, []);

  const handleUpload = () => {
    setReady(true);
  };

  return (
    <>
      <UploadDropzone onUpload={handleUpload} />
      <ToolGrid disabled={!ready} />
    </>
  );
}
