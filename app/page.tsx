"use client";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
  VideoTrack,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { useEffect, useState } from "react";
import { Track } from "livekit-client";

export default function Home() {
  const [token, setToken] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(
          `/api/token?room=my-room&username=user-${Math.floor(Math.random() * 1000)}`
        );
        const data = await resp.json();
        setToken(data.token);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  if (token === "") {
    return <div className="h-screen w-screen bg-black text-white flex items-center justify-center">Cargando...</div>;
  }

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="default"
      style={{ height: "100vh", backgroundColor: "#000", position: 'relative' }}
    >
      {/* Renderizamos el video y las miniaturas */}
      <CustomLayout />
      
      <RoomAudioRenderer />
      
      {/* Barra de control fija abajo */}
      <div style={{ position: 'absolute', bottom: 0, width: '100%', zIndex: 50 }}>
        <ControlBar />
      </div>
    </LiveKitRoom>
  );
}

function CustomLayout() {
  // Obtenemos TODOS los tracks de video (Cámaras y Pantallas)
  const tracks = useTracks(
    [Track.Source.Camera, Track.Source.ScreenShare],
    { onlySubscribed: false }
  );

  // Filtramos:
  // 1. Agente: NO es local y es una cámara.
  const agentTrack = tracks.find(t => !t.participant.isLocal && t.source === Track.Source.Camera);
  
  // 2. Mis Tracks (Miniaturas): Son locales (mi cámara o mi pantalla compartida).
  const myTracks = tracks.filter(t => t.participant.isLocal);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      
      {/* --- VIDEO PRINCIPAL (AGENTE) --- */}
      {agentTrack ? (
        <VideoTrack 
          trackRef={agentTrack} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      ) : (
        <div className="flex items-center justify-center h-full text-white">
          Esperando al Agente...
        </div>
      )}

      {/* --- MINIATURAS FLOTANTES (TÚ) --- */}
      {/* Posicionadas abajo a la derecha, encima de los controles */}
      <div style={{ 
        position: 'absolute', 
        bottom: '80px', 
        right: '20px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '10px',
        zIndex: 40
      }}>
        {myTracks.map((track) => (
          <div key={track.publication.trackSid} style={{ 
            width: '200px', 
            height: '112px', // Aspect ratio 16:9 aprox
            backgroundColor: '#222', 
            borderRadius: '8px', 
            overflow: 'hidden', 
            border: '1px solid #555',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
          }}>
            <VideoTrack 
              trackRef={track} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
        ))}
      </div>

    </div>
  );
}