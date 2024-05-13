"use client";

import React, { useRef, useState, useEffect } from "react";

const VideoCall: React.FC = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection>(new RTCPeerConnection());
  const [offer, setOffer] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      stream.getTracks().forEach((track) => pc.current.addTrack(track, stream));

      const localOffer = await pc.current.createOffer();
      await pc.current.setLocalDescription(localOffer);
      setOffer(JSON.stringify(localOffer));
    } catch (error) {
      console.error("Error starting call:", error);
    }
  };

  const handleAnswer = async () => {
    try {
      const remoteAnswer = JSON.parse(answer) as RTCSessionDescriptionInit;
      await pc.current.setRemoteDescription(
        new RTCSessionDescription(remoteAnswer)
      );
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  };

  const handleOffer = async () => {
    try {
      const remoteOffer = JSON.parse(offer) as RTCSessionDescriptionInit;
      await pc.current.setRemoteDescription(
        new RTCSessionDescription(remoteOffer)
      );

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      stream.getTracks().forEach((track) => pc.current.addTrack(track, stream));

      const localAnswer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(localAnswer);
      setAnswer(JSON.stringify(localAnswer));
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  };

  useEffect(() => {
    pc.current.ontrack = (event) => {
      if (
        remoteVideoRef.current &&
        remoteVideoRef.current.srcObject !== event.streams[0]
      ) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        // Handle ICE candidates if needed
        console.log("New ICE candidate:", event.candidate);
      }
    };
  }, []);

  return (
    <div>
      <h2>Local Video</h2>
      <video ref={localVideoRef} autoPlay playsInline></video>
      <h2>Remote Video</h2>
      <video ref={remoteVideoRef} autoPlay playsInline></video>
      <div>
        <button onClick={startCall}>Start Call</button>
        <textarea value={offer} readOnly rows={6} cols={50}></textarea>
        <button onClick={handleOffer}>Receive Call</button>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={6}
          cols={50}
        ></textarea>
        <button onClick={handleAnswer}>Submit Answer</button>
      </div>
    </div>
  );
};

export default VideoCall;
