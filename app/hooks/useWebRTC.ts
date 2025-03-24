// File: useWebRTC.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  doc,
  collection,
  addDoc,
  updateDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/app/services/firebase/firebase";

// Tipuri
export interface ParticipantType {
  id: string;
  peerId?: string;
  userName: string;
  isHost: boolean;
  joinedAt?: Date | { toDate: () => Date };
  streamActive?: boolean;
}

export interface DeviceIds {
  videoId?: string;
  audioId?: string;
}

export interface WebRTCHookReturn {
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  roomId: string | null;
  participants: ParticipantType[];
  isHost: boolean;
  initializeMedia: (
    video: boolean,
    audio: boolean,
    deviceIds?: DeviceIds
  ) => Promise<void>;
  createRoom: (userName: string) => Promise<void>;
  joinRoom: (roomId: string, userName: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  toggleTrack: (kind: "audio" | "video", enabled: boolean) => void;
  selectParticipantStream: (
    participantId: string,
    active: boolean
  ) => Promise<void>;
  selectedParticipants: string[];
}

// Configurare pentru serverele STUN/TURN cu opțiuni optimizate
const iceServers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
  ],
  iceCandidatePoolSize: 10,
  bundlePolicy: "max-bundle" as const,
  rtcpMuxPolicy: "require",
} satisfies RTCConfiguration;

const useWebRTC = (): WebRTCHookReturn => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<
    Record<string, MediaStream>
  >({});
  const [roomId, setRoomId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<ParticipantType[]>([]);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );
  const [userId, setUserId] = useState<string>("");

  // Referințe la conexiunile peer și streamul local
  const peerConnections = useRef<Record<string, RTCPeerConnection>>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const unsubscribersRef = useRef<(() => void)[]>([]);
  const isLeavingRef = useRef<boolean>(false);

  // Funcție helper pentru a crea și trimite o ofertă - acum este un callback
  const createAndSendOffer = useCallback(
    async (pc: RTCPeerConnection, peerId: string) => {
      try {
        // Verifică dacă nu cumva se negociază deja
        if (pc.signalingState === "have-local-offer") {
          console.log(`Negociere deja în curs cu ${peerId}, se sare peste`);
          return;
        }

        console.log(`Creare ofertă pentru ${peerId}`);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        if (pc.localDescription && roomId && !isLeavingRef.current) {
          console.log(`Trimitere ofertă către ${peerId}`);
          const offerRef = collection(db, "rooms", roomId, "offers");
          await addDoc(offerRef, {
            sender: userId,
            receiver: peerId,
            sdp: JSON.stringify(pc.localDescription),
            timestamp: serverTimestamp(),
          });
        }
      } catch (err) {
        console.error(`Eroare la crearea ofertei pentru ${peerId}:`, err);
      }
    },
    [roomId, userId]
  );

  // Verifică existența documentului și realizează operația
  const safeDocOperation = useCallback(
    async (docRef: any, operation: "update" | "delete" | "get", data?: any) => {
      try {
        // Verifică dacă documentul există
        const docSnapshot = await getDoc(docRef);

        if (docSnapshot.exists()) {
          if (operation === "update" && data) {
            await updateDoc(docRef, data);
            return true;
          } else if (operation === "delete") {
            await deleteDoc(docRef);
            return true;
          } else if (operation === "get") {
            return docSnapshot.data();
          }
        } else {
          console.log(
            `Documentul ${docRef.path} nu există pentru operația ${operation}`
          );
          // Pentru update, putem crea documentul dacă nu există
          if (operation === "update" && data) {
            await setDoc(docRef, data, { merge: true });
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error(
          `Eroare la operația ${operation} pe documentul ${docRef.path}:`,
          error
        );
        return false;
      }
    },
    []
  );

  // Inițializare media - îmbunătățită pentru gestionarea video
  const initializeMedia = useCallback(
    async (
      video: boolean,
      audio: boolean,
      deviceIds?: DeviceIds
    ): Promise<void> => {
      try {
        // Oprește track-urile existente
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => track.stop());
        }

        console.log("Inițializare media cu video:", video, "audio:", audio);

        // Pregătește constrângerile cu selecția dispozitivelor
        const constraints: MediaStreamConstraints = {
          video: video
            ? deviceIds?.videoId
              ? { deviceId: { exact: deviceIds.videoId } }
              : {
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                  frameRate: { min: 15, ideal: 30 },
                }
            : false,
          audio: audio
            ? deviceIds?.audioId
              ? { deviceId: { exact: deviceIds.audioId } }
              : {
                  echoCancellation: true,
                  noiseSuppression: true,
                  autoGainControl: true,
                }
            : false,
        };

        // Obține noul stream media
        console.log(
          "Solicitare acces la dispozitive media cu constrângerile:",
          constraints
        );
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log("Stream media obținut:", stream);

        // Verifică dacă stream-ul conține track-uri video/audio
        const videoTracks = stream.getVideoTracks();
        const audioTracks = stream.getAudioTracks();

        console.log(
          `Track-uri obținute: ${videoTracks.length} video, ${audioTracks.length} audio`
        );

        // Afișează informații despre fiecare track pentru depanare
        videoTracks.forEach((track) => {
          console.log(
            `Track video: ${track.label}, enabled: ${track.enabled}, muted: ${track.muted}`
          );
          const settings = track.getSettings();
          console.log("Setări video:", settings);
        });

        // Setează starea inițială a track-urilor
        videoTracks.forEach((track) => {
          track.enabled = video;
          console.log(`Track video ${track.label} setat enabled=${video}`);
        });

        audioTracks.forEach((track) => {
          track.enabled = audio;
          console.log(`Track audio ${track.label} setat enabled=${audio}`);
        });

        // Salvează și expune stream-ul
        localStreamRef.current = stream;
        setLocalStream(stream);
        console.log("Stream local setat în stare");

        // Dacă avem deja conexiuni peer, înlocuiește track-urile în ele
        Object.entries(peerConnections.current).forEach(([peerId, pc]) => {
          console.log(`Actualizare track-uri pentru conexiunea cu ${peerId}`);

          // Eliminăm track-urile vechi
          const senders = pc.getSenders();
          senders.forEach((sender) => {
            pc.removeTrack(sender);
          });

          // Adăugăm track-urile noi
          stream.getTracks().forEach((track) => {
            console.log(
              `Adăugare track ${track.kind} la conexiunea cu ${peerId}`
            );
            pc.addTrack(track, stream);
          });

          // Renegociem conexiunea
          createAndSendOffer(pc, peerId);
        });

        // Actualizează starea streamului în Firestore dacă suntem într-o cameră
        if (roomId && userId) {
          const participantRef = doc(
            db,
            "rooms",
            roomId,
            "participants",
            userId
          );

          // Folosește setDoc cu merge pentru a actualiza sau crea documentul
          await setDoc(
            participantRef,
            {
              hasAudio: audio,
              hasVideo: video,
              lastUpdated: serverTimestamp(),
            },
            { merge: true }
          );
        }
      } catch (error) {
        console.error("Eroare la inițializarea media:", error);
        if (error instanceof Error) {
          console.error("Detalii eroare:", error.message);
          console.error("Stack trace:", error.stack);
        }
        throw new Error(
          "Nu s-a putut accesa camera sau microfonul. Verifică permisiunile."
        );
      }
    },
    [roomId, userId, createAndSendOffer]
  );

  // Comută track-urile audio sau video
  const toggleTrack = useCallback(
    async (kind: "audio" | "video", enabled: boolean) => {
      if (!localStreamRef.current) return;

      const tracks =
        kind === "audio"
          ? localStreamRef.current.getAudioTracks()
          : localStreamRef.current.getVideoTracks();

      console.log(`Comutare track-uri ${kind} la starea ${enabled}`);

      tracks.forEach((track) => {
        track.enabled = enabled;
        console.log(`Track ${kind} ${track.label} setat enabled=${enabled}`);
      });

      // Actualizează starea în Firestore
      if (roomId && userId && !isLeavingRef.current) {
        const participantRef = doc(db, "rooms", roomId, "participants", userId);

        // Folosește setDoc cu merge în loc de updateDoc
        await setDoc(
          participantRef,
          {
            [kind === "audio" ? "hasAudio" : "hasVideo"]: enabled,
            lastUpdated: serverTimestamp(),
          },
          { merge: true }
        );
      }
    },
    [roomId, userId]
  );

  // Configurarea unei conexiuni peer - acum îmbunătățită
  const setupPeerConnection = useCallback(
    (peerId: string, initiator: boolean = false) => {
      // Dacă există deja o conexiune peer, verifică starea acesteia
      if (peerConnections.current[peerId]) {
        const existingPc = peerConnections.current[peerId];

        // Dacă conexiunea este într-o stare problematică, o resetăm
        if (
          existingPc.connectionState === "failed" ||
          existingPc.connectionState === "disconnected" ||
          existingPc.connectionState === "closed"
        ) {
          console.log(
            `Resetare conexiune problematică cu ${peerId} (stare: ${existingPc.connectionState})`
          );
          existingPc.close();
          delete peerConnections.current[peerId];
        } else {
          // Altfel, reutilizăm conexiunea existentă
          return existingPc;
        }
      }

      console.log(
        `Creez conexiune peer cu ${peerId} (initiator: ${initiator})`
      );

      // Creează o nouă conexiune peer
      const pc = new RTCPeerConnection(iceServers);
      peerConnections.current[peerId] = pc;

      // Adaugă stream-ul local la conexiunea peer
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          console.log(
            `Adăugare track ${track.kind} la conexiunea cu ${peerId}`
          );
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      // Gestionează candidații ICE
      pc.onicecandidate = async (event) => {
        if (event.candidate && roomId && !isLeavingRef.current) {
          console.log(`ICE candidate generat pentru ${peerId}`);
          const iceCandidateRef = collection(
            db,
            "rooms",
            roomId,
            "iceCandidates"
          );
          await addDoc(iceCandidateRef, {
            sender: userId,
            receiver: peerId,
            candidate: JSON.stringify(event.candidate),
            timestamp: serverTimestamp(),
          });
        }
      };

      // Gestionează conectarea ICE
      pc.oniceconnectionstatechange = () => {
        console.log(
          `Stare conexiune ICE pentru ${peerId}:`,
          pc.iceConnectionState
        );

        if (
          pc.iceConnectionState === "disconnected" ||
          pc.iceConnectionState === "failed" ||
          pc.iceConnectionState === "closed"
        ) {
          // Încercăm să refacem conexiunea sau să curățăm resursele
          if (!isLeavingRef.current && initiator) {
            console.log(`Reconectare la peer ${peerId} după deconectare.`);
            setTimeout(() => {
              createAndSendOffer(pc, peerId);
            }, 2000);
          }
        }
      };

      // Monitorizează starea conexiunii
      pc.onconnectionstatechange = () => {
        console.log(`Stare conexiune pentru ${peerId}:`, pc.connectionState);
      };

      // Gestionează stream-urile primite - îmbunătățit pentru debugging
      pc.ontrack = (event) => {
        console.log(`Am primit track de la ${peerId}:`, event.track.kind);
        console.log(
          `Track status: enabled=${event.track.enabled}, muted=${event.track.muted}, readyState=${event.track.readyState}`
        );

        // Verificăm dacă track-ul este activ
        if (event.track.readyState === "ended") {
          console.log(
            `Track-ul primit de la ${peerId} este deja încheiat, se ignoră`
          );
          return;
        }

        // Pentru depanare, adăugăm un listener pentru evenimente 'ended'
        event.track.onended = () => {
          console.log(
            `Track-ul ${event.track.kind} de la ${peerId} s-a încheiat`
          );
        };

        // Pentru depanare, adăugăm un listener pentru evenimente 'mute'/'unmute'
        event.track.onmute = () => {
          console.log(
            `Track-ul ${event.track.kind} de la ${peerId} a fost dezactivat`
          );
        };

        event.track.onunmute = () => {
          console.log(
            `Track-ul ${event.track.kind} de la ${peerId} a fost reactivat`
          );
        };

        setRemoteStreams((prev) => {
          // Creează un MediaStream nou dacă nu avem unul pentru acest peer
          if (!prev[peerId]) {
            const newStream = new MediaStream();
            newStream.addTrack(event.track);
            console.log(
              `Stream nou creat pentru ${peerId} cu track ${event.track.kind}`
            );
            return { ...prev, [peerId]: newStream };
          }

          // Adaugă track-ul la stream-ul existent dacă nu există deja
          const peerStream = prev[peerId];
          const trackExists = Array.from(peerStream.getTracks()).some(
            (track) => track.id === event.track.id
          );

          if (!trackExists) {
            peerStream.addTrack(event.track);
            console.log(
              `Track ${event.track.kind} adăugat la stream-ul existent pentru ${peerId}`
            );
          }

          return { ...prev };
        });

        // Adaugă automat acest participant la cei selectați dacă nu este deja
        setSelectedParticipants((prev) => {
          if (!prev.includes(peerId)) {
            console.log(`Adăugare ${peerId} la participanții selectați`);
            return [...prev, peerId];
          }
          return prev;
        });
      };

      // Inițiază negocierea dacă suntem inițiatorul
      if (initiator) {
        pc.onnegotiationneeded = async () => {
          console.log(`Negociere necesară pentru ${peerId}`);
          await createAndSendOffer(pc, peerId);
        };
      }

      return pc;
    },
    [roomId, userId, createAndSendOffer]
  );

  // Selectează sau deselectează stream-ul unui participant
  const selectParticipantStream = useCallback(
    async (participantId: string, active: boolean) => {
      console.log(`Selectare participant ${participantId}, activ: ${active}`);

      setSelectedParticipants((prev) => {
        if (active && !prev.includes(participantId)) {
          return [...prev, participantId];
        } else if (!active && prev.includes(participantId)) {
          return prev.filter((id) => id !== participantId);
        }
        return prev;
      });

      // Actualizează preferințele în Firestore
      if (roomId && userId && !isLeavingRef.current) {
        const userPrefsRef = doc(
          db,
          "rooms",
          roomId,
          "userPreferences",
          userId
        );

        try {
          const userPrefsDoc = await getDoc(userPrefsRef);

          if (userPrefsDoc.exists()) {
            const prefs = userPrefsDoc.data();
            const selectedPeers = prefs.selectedPeers || [];

            if (active && !selectedPeers.includes(participantId)) {
              selectedPeers.push(participantId);
            } else if (!active && selectedPeers.includes(participantId)) {
              const index = selectedPeers.indexOf(participantId);
              selectedPeers.splice(index, 1);
            }

            await setDoc(
              userPrefsRef,
              {
                selectedPeers,
                lastUpdated: serverTimestamp(),
              },
              { merge: true }
            );
            console.log(`Preferințe actualizate pentru ${participantId}`);
          } else {
            await setDoc(userPrefsRef, {
              selectedPeers: active ? [participantId] : [],
              lastUpdated: serverTimestamp(),
            });
            console.log(`Preferințe create pentru ${participantId}`);
          }
        } catch (error) {
          console.error("Eroare la actualizarea preferințelor:", error);
        }
      }
    },
    [roomId, userId]
  );

  // Configurează ascultătorii Firestore - acum îmbunătățită pentru a rezolva problemele de vizibilitate
  const setupFirestoreListeners = useCallback(() => {
    if (!roomId || !userId) return;

    // Curăță ascultătorii existenți
    unsubscribersRef.current.forEach((unsub) => unsub());
    unsubscribersRef.current = [];

    // Ascultător pentru participanți
    const participantsRef = collection(db, "rooms", roomId, "participants");
    const participantsUnsubscribe = onSnapshot(participantsRef, {
      next: (snapshot) => {
        const participantsList: ParticipantType[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();

          // Nu include propriul utilizator în lista de participanți
          if (doc.id !== userId) {
            const participantId = doc.id;

            participantsList.push({
              id: participantId,
              peerId: participantId,
              userName: data.userName,
              isHost: data.isHost || false,
              joinedAt: data.joinedAt,
              streamActive: selectedParticipants.includes(participantId),
            });

            // Configurează conexiunea peer dacă nu există deja
            const pc = setupPeerConnection(participantId, true);

            // ÎMBUNĂTĂȚIRE CRITICĂ: Inițiază imediat o negociere cu noul participant
            if (!peerConnections.current[participantId]?.localDescription) {
              console.log(
                `Inițiere negociere cu participantul nou ${participantId}`
              );
              createAndSendOffer(pc, participantId);
            }
          }
        });

        setParticipants(participantsList);
        console.log(
          `Lista participanți actualizată: ${participantsList.length} participanți`
        );
      },
      error: (error) => {
        console.error("Eroare la ascultarea participanților:", error);
      },
    });

    unsubscribersRef.current.push(participantsUnsubscribe);

    // Ascultător pentru oferte
    const offersRef = collection(db, "rooms", roomId, "offers");
    const offersQuery = query(offersRef, where("receiver", "==", userId));

    const offersUnsubscribe = onSnapshot(offersQuery, {
      next: async (snapshot) => {
        const promises = snapshot.docChanges().map(async (change) => {
          if (change.type === "added") {
            const data = change.doc.data();

            // Procesează oferta
            try {
              console.log(`Procesare ofertă de la ${data.sender}`);
              const peerId = data.sender;
              const pc = setupPeerConnection(peerId, false);
              const offerSdp = JSON.parse(data.sdp);

              await pc.setRemoteDescription(
                new RTCSessionDescription(offerSdp)
              );
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);

              if (!isLeavingRef.current) {
                console.log(`Trimitere răspuns către ${peerId}`);
                const answerRef = collection(db, "rooms", roomId, "answers");
                await addDoc(answerRef, {
                  sender: userId,
                  receiver: peerId,
                  sdp: JSON.stringify(pc.localDescription),
                  timestamp: serverTimestamp(),
                });
              }

              // Șterge oferta după procesare
              if (!isLeavingRef.current) {
                await deleteDoc(change.doc.ref);
                console.log(`Ofertă procesată și ștearsă`);
              }
            } catch (err) {
              console.error("Eroare la procesarea ofertei:", err);
            }
          }
        });

        // Așteaptă ca toate ofertele să fie procesate
        await Promise.all(promises);
      },
      error: (error) => {
        console.error("Eroare la ascultarea ofertelor:", error);
      },
    });

    unsubscribersRef.current.push(offersUnsubscribe);

    // Ascultător pentru răspunsuri
    const answersRef = collection(db, "rooms", roomId, "answers");
    const answersQuery = query(answersRef, where("receiver", "==", userId));

    const answersUnsubscribe = onSnapshot(answersQuery, {
      next: async (snapshot) => {
        const promises = snapshot.docChanges().map(async (change) => {
          if (change.type === "added") {
            const data = change.doc.data();

            // Procesează răspunsul
            try {
              console.log(`Procesare răspuns de la ${data.sender}`);
              const peerId = data.sender;
              const pc = peerConnections.current[peerId];

              if (pc) {
                const answerSdp = JSON.parse(data.sdp);
                await pc.setRemoteDescription(
                  new RTCSessionDescription(answerSdp)
                );
                console.log(`Răspuns procesat cu succes`);
              }

              // Șterge răspunsul după procesare
              if (!isLeavingRef.current) {
                await deleteDoc(change.doc.ref);
                console.log(`Răspuns șters după procesare`);
              }
            } catch (err) {
              console.error("Eroare la procesarea răspunsului:", err);
            }
          }
        });

        // Așteaptă ca toate răspunsurile să fie procesate
        await Promise.all(promises);
      },
      error: (error) => {
        console.error("Eroare la ascultarea răspunsurilor:", error);
      },
    });

    unsubscribersRef.current.push(answersUnsubscribe);

    // Ascultător pentru candidații ICE
    const iceCandidatesRef = collection(db, "rooms", roomId, "iceCandidates");
    const iceCandidatesQuery = query(
      iceCandidatesRef,
      where("receiver", "==", userId)
    );

    const iceCandidatesUnsubscribe = onSnapshot(iceCandidatesQuery, {
      next: async (snapshot) => {
        const promises = snapshot.docChanges().map(async (change) => {
          if (change.type === "added") {
            const data = change.doc.data();

            // Procesează candidatul ICE
            try {
              console.log(`Procesare candidat ICE de la ${data.sender}`);
              const peerId = data.sender;
              const pc = peerConnections.current[peerId];

              if (pc) {
                const candidate = JSON.parse(data.candidate);
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
                console.log(`Candidat ICE adăugat cu succes`);
              }

              // Șterge candidatul după procesare
              if (!isLeavingRef.current) {
                await deleteDoc(change.doc.ref);
              }
            } catch (err) {
              console.error("Eroare la adăugarea candidatului ICE:", err);
            }
          }
        });

        // Așteaptă ca toți candidații să fie procesați
        await Promise.all(promises);
      },
      error: (error) => {
        console.error("Eroare la ascultarea candidaților ICE:", error);
      },
    });

    unsubscribersRef.current.push(iceCandidatesUnsubscribe);

    // Ascultător pentru preferințele utilizatorului
    const userPrefsRef = doc(db, "rooms", roomId, "userPreferences", userId);

    const userPrefsUnsubscribe = onSnapshot(userPrefsRef, {
      next: (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.selectedPeers) {
            setSelectedParticipants(data.selectedPeers);
            console.log(
              `Preferințe actualizate: ${data.selectedPeers.length} participanți selectați`
            );
          }
        }
      },
      error: (error) => {
        console.error(
          "Eroare la ascultarea preferințelor utilizatorului:",
          error
        );
      },
    });

    unsubscribersRef.current.push(userPrefsUnsubscribe);

    // ÎMBUNĂTĂȚIRE CRITICĂ: Interval pentru anunțarea periodică a prezenței și verificarea conexiunilor
    const announceSelfInterval = setInterval(async () => {
      if (isLeavingRef.current) return;

      try {
        // Actualizează timestamp-ul participantului pentru a semnala prezența
        const participantRef = doc(db, "rooms", roomId, "participants", userId);
        await setDoc(
          participantRef,
          {
            lastActive: serverTimestamp(),
            hasAudio: localStream?.getAudioTracks()[0]?.enabled || false,
            hasVideo: localStream?.getVideoTracks()[0]?.enabled || false,
          },
          { merge: true }
        );
        console.log("Prezență anunțată");

        // Verifică participanții existenți și asigură-te că avem conexiuni cu toți
        const participantsSnapshot = await getDocs(participantsRef);
        participantsSnapshot.forEach((doc) => {
          if (doc.id !== userId) {
            const peerConnection = peerConnections.current[doc.id];

            // Dacă nu există o conexiune sau starea conexiunii este problematică,
            // încearcă să o resetezi
            if (
              !peerConnection ||
              peerConnection.connectionState === "failed" ||
              peerConnection.connectionState === "disconnected"
            ) {
              console.log(`Reconectare la participantul ${doc.id}`);
              const pc = setupPeerConnection(doc.id, true);
              createAndSendOffer(pc, doc.id);
            }
          }
        });
      } catch (error) {
        console.error("Eroare la anunțarea prezenței:", error);
      }
    }, 10000); // Verifică la fiecare 10 secunde

    // Curăță intervalul la dezabonare
    return () => {
      clearInterval(announceSelfInterval);
    };
  }, [
    roomId,
    userId,
    setupPeerConnection,
    selectedParticipants,
    createAndSendOffer,
    localStream,
  ]);

  // Creează o cameră nouă
  const createRoom = useCallback(
    async (userName: string): Promise<void> => {
      try {
        console.log("Începe crearea camerei...");

        // Generează un ID unic pentru utilizator
        const newUserId = Math.random().toString(36).substring(2, 10);
        setUserId(newUserId);
        console.log("ID utilizator generat:", newUserId);

        // Creează o cameră nouă în Firestore
        console.log("Încercare de creare a camerei în Firestore...");
        const roomsRef = collection(db, "rooms");
        const roomDoc = await addDoc(roomsRef, {
          createdAt: serverTimestamp(),
          createdBy: newUserId,
          active: true,
        });

        const newRoomId = roomDoc.id;
        console.log("Cameră creată cu succes, ID:", newRoomId);
        setRoomId(newRoomId);
        setIsHost(true);

        // Adaugă utilizatorul ca participant
        console.log("Adăugare utilizator ca participant...");
        const participantsRef = collection(
          db,
          "rooms",
          newRoomId,
          "participants"
        );

        await setDoc(doc(participantsRef, newUserId), {
          userName,
          isHost: true,
          joinedAt: serverTimestamp(),
          hasAudio: true,
          hasVideo: true,
        });
        console.log("Participant adăugat cu succes");

        // Configurează ascultătorii Firestore
        console.log("Configurare ascultători Firestore...");
        setupFirestoreListeners();
        console.log("Ascultători Firestore configurați");

        console.log(`Cameră creată complet: ${newRoomId}`);
        return Promise.resolve();
      } catch (error) {
        console.error("Eroare detaliată la crearea camerei:", error);
        if (error instanceof Error) {
          console.error("Mesaj eroare:", error.message);
          console.error("Stack trace:", error.stack);
        }
        return Promise.reject(error);
      }
    },
    [setupFirestoreListeners]
  );

  // Intră într-o cameră existentă
  const joinRoom = useCallback(
    async (roomIdToJoin: string, userName: string): Promise<void> => {
      try {
        console.log("Încercare de alăturare la camera:", roomIdToJoin);

        // Verifică dacă camera există
        const roomRef = doc(db, "rooms", roomIdToJoin);
        const roomDoc = await getDoc(roomRef);

        if (!roomDoc.exists()) {
          console.error("Camera nu există:", roomIdToJoin);
          throw new Error("Camera nu există");
        }

        // Verifică dacă camera este activă
        const roomData = roomDoc.data();
        if (roomData.active === false) {
          console.error("Încercare de alăturare la o cameră inactivă");
          throw new Error("Camera a fost închisă");
        }

        // Generează un ID unic pentru utilizator
        const newUserId = Math.random().toString(36).substring(2, 10);
        setUserId(newUserId);
        setRoomId(roomIdToJoin);
        setIsHost(false);
        console.log("ID utilizator generat:", newUserId);

        // Adaugă utilizatorul ca participant
        const participantsRef = collection(
          db,
          "rooms",
          roomIdToJoin,
          "participants"
        );

        console.log("Adăugare utilizator ca participant...");
        await setDoc(doc(participantsRef, newUserId), {
          userName,
          isHost: false,
          joinedAt: serverTimestamp(),
          hasAudio: true,
          hasVideo: true,
        });
        console.log("Participant adăugat cu succes");

        // Configurează ascultătorii Firestore
        console.log("Configurare ascultători Firestore...");
        setupFirestoreListeners();
        console.log("Ascultători Firestore configurați");

        console.log(`Cameră accesată cu succes: ${roomIdToJoin}`);
        return Promise.resolve();
      } catch (error) {
        console.error("Eroare detaliată la intrarea în cameră:", error);
        if (error instanceof Error) {
          console.error("Mesaj eroare:", error.message);
          console.error("Stack trace:", error.stack);
        }
        return Promise.reject(error);
      }
    },
    [setupFirestoreListeners]
  );

  // Părăsește camera curentă
  const leaveRoom = useCallback(async (): Promise<void> => {
    if (!roomId || !userId) return Promise.resolve();

    try {
      console.log("Începe procesul de părăsire a camerei...");

      // Marcăm faptul că părăsim camera pentru a evita operațiile inutile
      isLeavingRef.current = true;

      // Elimină participantul din Firestore
      console.log("Ștergere participant din Firestore...");
      const participantRef = doc(db, "rooms", roomId, "participants", userId);

      // Verifică dacă documentul există înainte de a-l șterge
      const participantDoc = await getDoc(participantRef);
      if (participantDoc.exists()) {
        await deleteDoc(participantRef);
        console.log("Participant șters cu succes");
      } else {
        console.log("Documentul participantului nu există, nimic de șters");
      }

      // Dacă este gazdă și nu mai sunt alți participanți, marchează camera ca inactivă
      if (isHost) {
        console.log("Verificare dacă mai sunt participanți activi...");
        const participantsRef = collection(db, "rooms", roomId, "participants");
        const participantsSnapshot = await getDocs(participantsRef);

        if (participantsSnapshot.empty) {
          console.log(
            "Nu mai sunt participanți, marcare cameră ca inactivă..."
          );
          const roomRef = doc(db, "rooms", roomId);
          await updateDoc(roomRef, {
            active: false,
            endedAt: serverTimestamp(),
          });
          console.log("Cameră marcată ca inactivă");
        } else {
          console.log(
            `Există încă ${participantsSnapshot.size} participanți activi`
          );
        }
      }

      // Oprește ascultătorii Firestore
      console.log("Oprire ascultători Firestore...");
      unsubscribersRef.current.forEach((unsub) => unsub());
      unsubscribersRef.current = [];
      console.log("Ascultători Firestore opriți");

      // Închide toate conexiunile peer
      console.log("Închidere conexiuni peer...");
      Object.values(peerConnections.current).forEach((pc) => {
        pc.close();
      });
      peerConnections.current = {};
      console.log("Conexiuni peer închise");

      // Oprește toate stream-urile remote
      console.log("Oprire stream-uri remote...");
      Object.values(remoteStreams).forEach((stream) => {
        stream.getTracks().forEach((track) => track.stop());
      });
      console.log("Stream-uri remote oprite");

      // Resetează starea
      console.log("Resetare stare...");
      setRoomId(null);
      setParticipants([]);
      setRemoteStreams({});
      setIsHost(false);
      setSelectedParticipants([]);

      // Resetăm semnalul de părăsire
      isLeavingRef.current = false;

      console.log("Cameră părăsită cu succes");
      return Promise.resolve();
    } catch (error) {
      console.error("Eroare detaliată la părăsirea camerei:", error);
      isLeavingRef.current = false;

      if (error instanceof Error) {
        console.error("Mesaj eroare:", error.message);
        console.error("Stack trace:", error.stack);
      }

      // Resetăm starea chiar și în caz de eroare, pentru a evita blocarea utilizatorului
      setRoomId(null);
      setParticipants([]);
      setRemoteStreams({});
      setIsHost(false);
      setSelectedParticipants([]);

      return Promise.reject(error);
    }
  }, [roomId, userId, isHost, remoteStreams]);

  // Curățare la demontare
  useEffect(() => {
    return () => {
      // Marcăm faptul că părăsim camera
      isLeavingRef.current = true;

      // Oprește stream-ul local
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Oprește toate stream-urile remote
      Object.values(remoteStreams).forEach((stream) => {
        stream.getTracks().forEach((track) => track.stop());
      });

      // Închide toate conexiunile peer
      Object.values(peerConnections.current).forEach((pc) => {
        pc.close();
      });

      // Oprește ascultătorii Firestore
      unsubscribersRef.current.forEach((unsub) => unsub());

      // Încearcă să actualizeze starea în Firestore
      if (roomId && userId) {
        const participantRef = doc(db, "rooms", roomId, "participants", userId);

        // Folosim getDoc pentru a verifica dacă documentul există înainte de a-l șterge
        getDoc(participantRef)
          .then((docSnapshot) => {
            if (docSnapshot.exists()) {
              return deleteDoc(participantRef);
            }
          })
          .catch((err) => {
            console.error("Eroare la curățarea participantului:", err);
          });
      }
    };
  }, [remoteStreams, roomId, userId]);

  // Detector de reconectare la rețea
  useEffect(() => {
    const handleOnline = async () => {
      console.log("Conexiune la rețea restabilită");

      // Dacă eram într-o cameră, încercăm să recreăm participantul
      if (roomId && userId && !isLeavingRef.current) {
        const participantRef = doc(db, "rooms", roomId, "participants", userId);

        try {
          const docSnapshot = await getDoc(participantRef);

          if (!docSnapshot.exists()) {
            console.log("Recrearea participantului după reconectare");
            await setDoc(participantRef, {
              userName: "Utilizator reconectat",
              isHost: isHost,
              joinedAt: serverTimestamp(),
              hasAudio: localStream?.getAudioTracks()[0]?.enabled || true,
              hasVideo: localStream?.getVideoTracks()[0]?.enabled || true,
              reconnected: true,
            });

            // Reconfigurăm ascultătorii
            setupFirestoreListeners();
          }
        } catch (error) {
          console.error(
            "Eroare la recrearea participantului după reconectare:",
            error
          );
        }
      }
    };

    const handleOffline = () => {
      console.log("Conexiune la rețea pierdută");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [roomId, userId, isHost, localStream, setupFirestoreListeners]);

  // Verifică permisiunile pentru cameră și microfon la încărcarea componentei
  useEffect(() => {
    // Verifică dacă browserul suportă getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("Browser-ul nu suportă getUserMedia!");
      return;
    }

    // Verifică permisiunile pentru cameră și microfon
    const checkPermissions = async () => {
      try {
        // Solicită permisiuni pentru cameră și microfon
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        console.log("Permisiuni acordate pentru cameră și microfon!");

        // Eliberează resursele
        stream.getTracks().forEach((track) => track.stop());
      } catch (error) {
        console.error("Eroare la verificarea permisiunilor:", error);
      }
    };

    checkPermissions();
  }, []);

  return {
    localStream,
    remoteStreams,
    roomId,
    participants,
    isHost,
    initializeMedia,
    createRoom,
    joinRoom,
    leaveRoom,
    toggleTrack,
    selectParticipantStream,
    selectedParticipants,
  };
};

export default useWebRTC;
