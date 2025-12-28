import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mic, Square, Play, Pause, Upload, Trash2, Save, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function ParentAudioRecorder({ page, book, language = 'en', onClose, onSave }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.info('Recording started...');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      toast.success('Recording stopped');
    }
  };

  const playAudio = () => {
    if (audioPlayerRef.current && audioUrl) {
      if (isPlaying) {
        audioPlayerRef.current.pause();
        setIsPlaying(false);
      } else {
        audioPlayerRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setRecordingTime(0);
    toast.info('Recording deleted');
  };

  const saveRecording = async () => {
    if (!audioBlob) {
      toast.error('No recording to save');
      return;
    }

    setIsUploading(true);
    try {
      // Convert webm to mp3 file for upload
      const file = new File([audioBlob], `parent-narration-${Date.now()}.webm`, {
        type: 'audio/webm'
      });

      // Upload to storage
      const uploadResult = await base44.integrations.Core.UploadFile({ file });

      // Update page with parent audio URL
      const audioField = language === 'pt' ? 'parent_audio_pt_url' : 'parent_audio_en_url';
      const user = await base44.auth.me();
      
      await base44.entities.Page.update(page.id, {
        [audioField]: uploadResult.file_url,
        parent_audio_recorded_by: user.id
      });

      toast.success('Recording saved successfully!');
      
      if (onSave) {
        onSave({
          audioUrl: uploadResult.file_url,
          language
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving recording:', error);
      toast.error('Failed to save recording');
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-red-500" />
            Record Your Voice - Page {page.page_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Story Text */}
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50">
            <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              📖 Story Text ({language === 'en' ? 'English' : 'Portuguese'}):
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              {language === 'en' ? page.story_text_en : page.story_text_pt}
            </p>
          </Card>

          {/* Recording Instructions */}
          {!audioBlob && !isRecording && (
            <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-orange-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-semibold mb-2">Recording Tips:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Find a quiet place to record</li>
                    <li>Read the story text naturally and clearly</li>
                    <li>You can re-record if you're not happy with it</li>
                    <li>Your child will hear this when reading the story</li>
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {/* Recording Controls */}
          <div className="flex flex-col items-center gap-4">
            <AnimatePresence mode="wait">
              {isRecording ? (
                <motion.div
                  key="recording"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="text-center"
                >
                  <div className="relative inline-block mb-4">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 bg-red-500 rounded-full opacity-30"
                    />
                    <Button
                      onClick={stopRecording}
                      size="lg"
                      className="relative bg-red-500 hover:bg-red-600 rounded-full w-20 h-20"
                    >
                      <Square className="w-8 h-8" fill="white" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-2xl font-mono font-bold text-red-600">
                      {formatTime(recordingTime)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Recording in progress...</p>
                </motion.div>
              ) : audioBlob ? (
                <motion.div
                  key="recorded"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full space-y-4"
                >
                  <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        <span className="font-semibold text-gray-700">Recording Ready</span>
                      </div>
                      <span className="text-sm text-gray-600">{formatTime(recordingTime)}</span>
                    </div>
                    
                    <audio
                      ref={audioPlayerRef}
                      src={audioUrl}
                      onEnded={() => setIsPlaying(false)}
                      className="hidden"
                    />

                    <div className="flex gap-2">
                      <Button
                        onClick={playAudio}
                        variant="outline"
                        className="flex-1"
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-4 h-4 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Play
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={deleteRecording}
                        variant="outline"
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </Card>

                  <Button
                    onClick={saveRecording}
                    disabled={isUploading}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    size="lg"
                  >
                    {isUploading ? (
                      <>
                        <Upload className="w-5 h-5 mr-2 animate-pulse" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Recording
                      </>
                    )}
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="initial"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <Button
                    onClick={startRecording}
                    size="lg"
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-full w-20 h-20 shadow-xl"
                  >
                    <Mic className="w-8 h-8" />
                  </Button>
                  <p className="text-sm text-gray-600 mt-4">Click to start recording</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cancel Button */}
          {!isRecording && (
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}