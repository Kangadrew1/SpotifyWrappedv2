import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

/**
 * WrappedDetail Component
 *
 * This component displays detailed information about a specific Spotify Wrapped artist.
 * Users can navigate between artists, play audio previews, and make their Wrapped history public.
 *
 * Features:
 * - Displays detailed artist information including name, top song, description, and image.
 * - Allows navigation between artists using Next and Previous buttons.
 * - Plays an audio preview of the artist's top song if available.
 * - Provides a button to make the Wrapped history public.
 *
 * State:
 * - currentIndex: Tracks the index of the currently displayed artist.
 * - currentArtist: Stores the details of the currently displayed artist.
 * - audioRef: Ref for managing the audio element.
 * - audioLoaded: Indicates if the audio has been loaded and is ready to play.
 * - trackId: Stores the ID of the current artist's top song for audio preview.
 *
 * Props (from React Router):
 * - wrapped_id: The ID of the Wrapped history (from URL parameters).
 * - artists: Array of artist objects passed via location.state.
 */
function WrappedDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { wrapped_id } = useParams(); // Extract wrapped_id from URL
  const { artists } = location.state || {};
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentArtist, setCurrentArtist] = useState(artists ? artists[currentIndex] : {});
  const [audioRef, setAudioRef] = useState(null); // Ref for audio element
  const [audioLoaded, setAudioLoaded] = useState(false); // Tracks audio load state
  const [trackId, setTrackId] = useState(null); // ID for top song preview

  // Update trackId based on the current artist
  useEffect(() => {
    if (artists && artists[currentIndex]) {
      const currentArtist = artists[currentIndex];
      if (currentArtist.song_preview) {
        setTrackId(currentArtist.top_song_id);
      }
    }
  }, [currentIndex, artists]);

  // Update current artist when the index changes
  useEffect(() => {
    if (artists && artists[currentIndex]) {
      setCurrentArtist(artists[currentIndex]);
    }
  }, [currentIndex, artists]);

  // Play audio when it is loaded
  useEffect(() => {
    if (audioLoaded && audioRef) {
      audioRef.play();
      audioRef.muted = false;
    }
  }, [audioRef, audioLoaded]);

  /**
   * Handles navigation to the next artist.
   */
  const handleNext = () =>
    setCurrentIndex((prevIndex) => (prevIndex === artists.length - 1 ? 0 : prevIndex + 1));

  /**
   * Handles navigation to the previous artist.
   */
  const handlePrev = () =>
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? artists.length - 1 : prevIndex - 1));

  /**
   * Handles navigation back to the previous page.
   */
  const handleBack = () => navigate(-1);

  /**
   * Makes the current Wrapped history public.
   *
   * Sends a POST request to the backend API to make the Wrapped history public.
   */
  const makePublic = async () => {
    try {
      const response = await fetch(`/api/wrapped/make-public/${wrapped_id}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        alert("Wrapped history made public!");
      } else {
        alert("Error making Wrapped public");
      }
    } catch (error) {
      console.error("Error making Wrapped public:", error);
      alert("An error occurred while making the Wrapped public.");
    }
  };

  return (
    <div className="h-screen w-screen bg-spotifyBlack text-white flex flex-col justify-center items-center relative">
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 px-4 py-2 bg-spotifyGreen text-black font-bold rounded hover:bg-spotifyGreenHover transition"
      >
        Back
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentArtist.id}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="w-3/4 max-w-3xl p-8 bg-gradient-to-r from-spotifyGreen via-spotifyBlue to-spotifyPurple rounded-lg shadow-lg text-center"
        >
          <div className="w-72 h-72 mx-auto mb-4 overflow-hidden rounded-lg shadow-md">
            <img
              src={currentArtist.images?.[0]?.url || "https://via.placeholder.com/300"}
              alt={currentArtist.name}
              className="w-full h-full object-contain"
            />
          </div>

          <h2 className="mt-4 text-3xl font-bold text-white">
            {currentArtist.name}
          </h2>
          <p className="mt-2 text-lg text-spotifyGreen">
            Most Listened To: {currentArtist.top_song}
          </p>
          <p className="mt-2 text-lg">{currentArtist.description}</p>

          {trackId && (
            <div className="mt-4">
              <audio
                autoPlay
                ref={(audio) => setAudioRef(audio)}
                onLoadedData={() => setAudioLoaded(true)}
                src={`https://p.scdn.co/mp3-preview/${trackId}`}
                className="hidden"
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex mt-4 space-x-4">
        <button
          onClick={handlePrev}
          className="px-4 py-2 bg-spotifyGreen text-black font-bold rounded hover:bg-spotifyGreenHover transition"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-spotifyGreen text-black font-bold rounded hover:bg-spotifyGreenHover transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default WrappedDetail;
